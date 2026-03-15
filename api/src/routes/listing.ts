import { Hono } from 'hono';
import { getListingById } from '../services/gprmls.service.js';

const router = new Hono();

/** GET /api/listing/:id — single property by MLS listing key */
router.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!id) {
    return c.json({ error: 'Missing listing id' }, 400);
  }

  try {
    const property = await getListingById(id);
    if (!property) {
      return c.json({ error: 'Listing not found' }, 404);
    }
    return c.json({ data: property });
  } catch (err) {
    console.error(`[GET /listing/${id}]`, err);
    return c.json({ error: 'Failed to fetch listing' }, 502);
  }
});

export default router;
