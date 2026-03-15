import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  searchListings,
  getAgentListings,
  getSoldListings,
} from '../services/gprmls.service.js';
import type { PropertySearchFilters } from '../types/property.js';

const router = new Hono();

const searchSchema = z.object({
  query:        z.string().optional(),
  minPrice:     z.coerce.number().optional(),
  maxPrice:     z.coerce.number().optional(),
  minBeds:      z.coerce.number().optional(),
  minBaths:     z.coerce.number().optional(),
  propertyType: z.string().optional(),
  neighborhood: z.string().optional(),
  state:        z.enum(['NE', 'IA']).optional(),
  agentOnly:    z.coerce.boolean().optional(),
});

/** GET /api/listings — search active/pending listings */
router.get('/', zValidator('query', searchSchema), async (c) => {
  const q = c.req.valid('query');

  try {
    const filters: PropertySearchFilters = {
      query:        q.query,
      minPrice:     q.minPrice,
      maxPrice:     q.maxPrice,
      minBeds:      q.minBeds,
      minBaths:     q.minBaths,
      propertyType: q.propertyType,
      neighborhood: q.neighborhood,
      state:        q.state,
    };

    const listings = q.agentOnly
      ? await getAgentListings()
      : await searchListings(filters);

    return c.json({ data: listings, count: listings.length });
  } catch (err) {
    console.error('[GET /listings]', err);
    return c.json({ error: 'Failed to fetch listings' }, 502);
  }
});

/** GET /api/listings/sold — sold properties */
router.get('/sold', async (c) => {
  const state = c.req.query('state') as 'NE' | 'IA' | undefined;
  try {
    const sold = await getSoldListings(state);
    return c.json({ data: sold, count: sold.length });
  } catch (err) {
    console.error('[GET /listings/sold]', err);
    return c.json({ error: 'Failed to fetch sold listings' }, 502);
  }
});

export default router;
