import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { chatWithListings } from '../services/gemini.service.js';
import { searchListings } from '../services/gprmls.service.js';
import { cache } from '../services/cache.service.js';

const router = new Hono();

const RATE_LIMIT_WINDOW = 60;   // seconds
const RATE_LIMIT_MAX    = 15;   // requests per window

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string().min(1).max(1000),
    })
  ).min(1).max(20),
});

router.post('/', zValidator('json', chatSchema), async (c) => {
  // ── Rate limit by IP ────────────────────────────────────────────────────────
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ??
    c.req.header('x-real-ip') ??
    'unknown';

  const count = await cache.incr(`ratelimit:chat:${ip}`, RATE_LIMIT_WINDOW);
  if (count > RATE_LIMIT_MAX) {
    return c.json({ error: 'Too many requests. Please wait a moment.' }, 429);
  }

  const { messages } = c.req.valid('json');

  try {
    // Fetch active listings to give Gemini context
    const listings = await searchListings();

    const geminiResponse = await chatWithListings(messages, listings);

    // Look up full property objects for the returned IDs
    const properties = geminiResponse.propertyIds
      .map(id => listings.find(p => p.id === id))
      .filter(Boolean);

    return c.json({
      message:     geminiResponse.message,
      properties,
      showLeadCTA: geminiResponse.showLeadCTA,
      leadPrompt:  geminiResponse.leadPrompt ?? null,
    });
  } catch (err) {
    console.error('[POST /chat]', err);
    return c.json({ error: 'Failed to process chat request' }, 502);
  }
});

export default router;
