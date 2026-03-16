import { defineConfig } from 'drizzle-kit';

// Migrations use the direct (non-pooled) URL — port 5432, not 6543.
// Falls back to DATABASE_URL if direct URL not set.
const url = process.env['DATABASE_DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? '';

export default defineConfig({
  schema:    './src/db/schema.ts',
  out:       './drizzle',
  dialect:   'postgresql',
  dbCredentials: { url },
  verbose:   true,
  strict:    true,
});
