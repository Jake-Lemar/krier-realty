import type { Context, Next } from 'hono';

/**
 * API key middleware.
 *
 * Reads the expected key from the API_KEY env var. If unset (local dev without
 * a key configured) the middleware passes through so development is frictionless.
 *
 * Clients must send one of:
 *   Authorization: Bearer <key>
 *   x-api-key: <key>
 */
export async function apiKeyAuth(c: Context, next: Next) {
  const expectedKey = process.env['API_KEY'];

  // If no key is configured (local dev), skip auth.
  if (!expectedKey) {
    await next();
    return;
  }

  const authHeader = c.req.header('authorization');
  const apiKeyHeader = c.req.header('x-api-key');

  const provided =
    apiKeyHeader ??
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (!provided || provided !== expectedKey) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
}
