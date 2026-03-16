import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { adminAuth } from '../../middleware/adminAuth.js';
import { leadRepository } from '../../repositories/lead.repository.js';
import { isDbConfigured } from '../../db/index.js';

const router = new Hono();

router.use('*', adminAuth);

const STATUSES  = ['new', 'contacted', 'qualified', 'closed', 'lost'] as const;
const TYPES     = ['buyer', 'seller', 'contact', 'tour'] as const;
const ORIGINS   = ['website', 'manual', 'zillow', 'realtor_com', 'facebook', 'referral', 'cold_call', 'other'] as const;

const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  origin: z.enum(ORIGINS).optional(),
  limit:  z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
});

const createSchema = z.object({
  type:             z.enum(TYPES),
  name:             z.string().min(1).max(200),
  email:            z.string().email(),
  phone:            z.string().max(30).optional(),
  message:          z.string().max(5000).optional(),
  address:          z.string().max(500).optional(),
  preferredContact: z.string().max(50).optional(),
  propertyId:       z.string().max(100).optional(),
  source:           z.string().max(200).optional(),
  origin:           z.enum(ORIGINS).default('manual'),
  status:           z.enum(STATUSES).default('new'),
  notes:            z.string().max(5000).optional(),
});

const updateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  origin: z.enum(ORIGINS).optional(),
  notes:  z.string().max(5000).optional(),
});

function dbRequired(c: any) {
  if (!isDbConfigured()) {
    c.json({ error: 'Database not configured' }, 503);
    return false;
  }
  return true;
}

/** GET /api/admin/leads */
router.get('/', zValidator('query', listQuerySchema), async (c) => {
  if (!dbRequired(c)) return;
  const { status, origin, limit, offset } = c.req.valid('query');
  try {
    const result = await leadRepository.findAll({ status, origin, limit, offset });
    return c.json({ ...result, limit, offset });
  } catch (err) {
    console.error('[GET /admin/leads]', err);
    return c.json({ error: 'Failed to fetch leads' }, 502);
  }
});

/** POST /api/admin/leads — manual lead creation */
router.post('/', zValidator('json', createSchema), async (c) => {
  if (!dbRequired(c)) return;
  const data = c.req.valid('json');
  try {
    const lead = await leadRepository.create(data);
    return c.json({ data: lead }, 201);
  } catch (err) {
    console.error('[POST /admin/leads]', err);
    return c.json({ error: 'Failed to create lead' }, 502);
  }
});

/** GET /api/admin/leads/:id */
router.get('/:id', async (c) => {
  if (!dbRequired(c)) return;
  const id = c.req.param('id');
  try {
    const lead = await leadRepository.findById(id);
    if (!lead) return c.json({ error: 'Lead not found' }, 404);
    return c.json({ data: lead });
  } catch (err) {
    console.error('[GET /admin/leads/:id]', err);
    return c.json({ error: 'Failed to fetch lead' }, 502);
  }
});

/** PATCH /api/admin/leads/:id */
router.patch('/:id', zValidator('json', updateSchema), async (c) => {
  if (!dbRequired(c)) return;
  const id = c.req.param('id');
  const data = c.req.valid('json');
  try {
    const lead = await leadRepository.update(id, data);
    if (!lead) return c.json({ error: 'Lead not found' }, 404);
    return c.json({ data: lead });
  } catch (err) {
    console.error('[PATCH /admin/leads/:id]', err);
    return c.json({ error: 'Failed to update lead' }, 502);
  }
});

export default router;
