import type { Context, Next } from 'hono';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Cache the JWKS fetcher per URL
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(supabaseUrl: string) {
  if (!jwksCache.has(supabaseUrl)) {
    const url = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    jwksCache.set(supabaseUrl, createRemoteJWKSet(url));
  }
  return jwksCache.get(supabaseUrl)!;
}

export async function adminAuth(c: Context, next: Next) {
  const supabaseUrl = process.env['SUPABASE_URL'];
  if (!supabaseUrl) {
    return c.json({ error: 'Admin auth not configured' }, 503);
  }

  const authHeader = c.req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(supabaseUrl));
    const email = (payload['email'] as string | undefined)?.toLowerCase();

    if (!email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allowlist = (process.env['ADMIN_EMAILS'] ?? '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowlist.length === 0 || !allowlist.includes(email)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Attach user info for downstream handlers
    c.set('adminEmail', email);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
}
