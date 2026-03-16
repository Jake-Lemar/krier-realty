import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { sanitizeString, isSuspicious, normalizeEmail, normalizePhone } from '../utils/sanitize.js';
import { sendLeadNotification } from '../services/email.service.js';
import { cache } from '../services/cache.service.js';
import { leadRepository } from '../repositories/lead.repository.js';
import { isDbConfigured } from '../db/index.js';

const router = new Hono();

// ─── Rate limit constants ──────────────────────────────────────────────────────
const IP_LIMIT        = 10;   // per hour per IP
const CONTACT_LIMIT   = 3;    // per hour per email or phone
const WINDOW          = 3600; // 1 hour in seconds

const leadSchema = z.object({
  type:             z.enum(['buyer', 'seller', 'contact', 'tour']),
  name:             z.string().min(2).max(100),
  email:            z.string().email().max(200),
  phone:            z.string().max(30).optional(),
  message:          z.string().max(2000).optional(),
  propertyId:       z.string().max(50).optional(),
  address:          z.string().max(300).optional(),
  preferredContact: z.string().max(50).optional(),
  source:           z.string().max(100).optional(),
});

router.post('/', zValidator('json', leadSchema), async (c) => {
  const raw = c.req.valid('json');

  // ── Spoofing / injection check ───────────────────────────────────────────────
  const fieldsToCheck = [raw.name, raw.email, raw.message, raw.address, raw.source]
    .filter((v): v is string => typeof v === 'string');

  if (fieldsToCheck.some(isSuspicious)) {
    return c.json({ error: 'Invalid input' }, 400);
  }

  // ── Sanitize all string fields ───────────────────────────────────────────────
  const lead = {
    ...raw,
    name:             sanitizeString(raw.name, 100),
    email:            normalizeEmail(raw.email),
    phone:            raw.phone            ? sanitizeString(raw.phone, 30)            : undefined,
    message:          raw.message          ? sanitizeString(raw.message, 2000)        : undefined,
    address:          raw.address          ? sanitizeString(raw.address, 300)         : undefined,
    preferredContact: raw.preferredContact ? sanitizeString(raw.preferredContact, 50) : undefined,
    source:           raw.source           ? sanitizeString(raw.source, 100)          : undefined,
  };

  // ── Rate limiting ────────────────────────────────────────────────────────────
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim()
           ?? c.req.header('x-real-ip')
           ?? 'unknown';

  const [ipCount, emailCount, phoneCount] = await Promise.all([
    cache.incr(`ratelimit:lead:ip:${ip}`,             WINDOW),
    cache.incr(`ratelimit:lead:email:${lead.email}`,  WINDOW),
    lead.phone
      ? cache.incr(`ratelimit:lead:phone:${normalizePhone(lead.phone)}`, WINDOW)
      : Promise.resolve(0),
  ]);

  if (ipCount > IP_LIMIT || emailCount > CONTACT_LIMIT || phoneCount > CONTACT_LIMIT) {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  console.log('[Lead]', JSON.stringify({ ...lead, ts: new Date().toISOString() }));

  try {
    // Persist to database first so we have an ID for the admin link
    let adminUrl: string | undefined;
    if (isDbConfigured()) {
      const saved = await leadRepository.create({
        type:             lead.type,
        name:             lead.name,
        email:            lead.email,
        phone:            lead.phone,
        message:          lead.message,
        propertyId:       lead.propertyId,
        address:          lead.address,
        preferredContact: lead.preferredContact,
        source:           lead.source,
      });
      const adminBase = process.env['ADMIN_BASE_URL']?.replace(/\/$/, '');
      if (adminBase && saved?.id) {
        adminUrl = `${adminBase}/admin/leads/${saved.id}`;
      }
    }

    await sendLeadNotification({ ...lead, adminUrl });

    return c.json({
      success: true,
      message: 'Thank you! Aaron will be in touch shortly.',
    });
  } catch (err) {
    console.error('[POST /leads]', err);
    // Still return success to the user — lead is logged even if email fails
    return c.json({
      success: true,
      message: 'Thank you! Aaron will be in touch shortly.',
    });
  }
});

export default router;
