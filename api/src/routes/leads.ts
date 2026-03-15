import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const router = new Hono();

const leadSchema = z.object({
  type:             z.enum(['buyer', 'seller', 'contact', 'tour']),
  name:             z.string().min(2),
  email:            z.string().email(),
  phone:            z.string().optional(),
  message:          z.string().optional(),
  propertyId:       z.string().optional(),
  address:          z.string().optional(),
  preferredContact: z.string().optional(),
  source:           z.string().optional(),
});

/**
 * POST /api/leads — submit a buyer/seller/contact/tour lead.
 *
 * Current behavior: logs to console + returns success. Replace the
 * // TODO blocks below with your CRM webhook or email service calls.
 */
router.post('/', zValidator('json', leadSchema), async (c) => {
  const lead = c.req.valid('json');

  console.log('[Lead]', JSON.stringify({ ...lead, ts: new Date().toISOString() }));

  try {
    // ── TODO: CRM webhook (HubSpot / Salesforce) ────────────────────────────
    // const crmWebhookUrl = process.env['CRM_WEBHOOK_URL'];
    // if (crmWebhookUrl) {
    //   await fetch(crmWebhookUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(lead),
    //   });
    // }

    // ── TODO: Email notification (SendGrid / Resend) ─────────────────────────
    // await sendLeadEmail(lead);

    return c.json({
      success: true,
      message: "Thank you! Aaron will be in touch shortly.",
    });
  } catch (err) {
    console.error('[POST /leads]', err);
    return c.json({ error: 'Failed to submit lead' }, 502);
  }
});

export default router;
