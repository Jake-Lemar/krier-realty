import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { buildCors } from './middleware/cors.js';
import { apiKeyAuth } from './middleware/auth.js';
import listingsRouter from './routes/listings.js';
import listingRouter from './routes/listing.js';
import leadsRouter from './routes/leads.js';

const app = new Hono().basePath('/api');

// ─── Global middleware ─────────────────────────────────────────────────────────
app.use('*', buildCors());
app.use('*', logger());
app.use('*', apiKeyAuth);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (c) =>
  c.json({ status: 'ok', ts: new Date().toISOString() })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.route('/listings', listingsRouter);
app.route('/listing', listingRouter);
app.route('/leads', leadsRouter);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// ─── Error handler ────────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('[Unhandled error]', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
