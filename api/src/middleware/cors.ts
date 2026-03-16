import { cors } from 'hono/cors';

/**
 * CORS middleware configured from the ALLOWED_ORIGINS env var.
 *
 * ALLOWED_ORIGINS should be a comma-separated list of origins, e.g.:
 *   http://localhost:4200,https://yourdomain.com
 *
 * Falls back to localhost:4200 only if unset.
 */
export function buildCors() {
  const raw = process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:4200';
  const allowed = new Set(raw.split(',').map(o => o.trim()).filter(Boolean));

  return cors({
    origin: (origin) => (allowed.has(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    maxAge: 86400,
  });
}
