import { defineConfig } from 'drizzle-kit';
import fs from 'fs';

// In CI individual PG* vars are used to avoid URL-encoding issues with special
// characters in passwords. Locally / production falls back to the connection URL.
const dbCredentials = process.env['PGHOST']
  ? {
      host:     process.env['PGHOST']!,
      port:     Number(process.env['PGPORT'] ?? 5432),
      user:     process.env['PGUSER']!,
      password: process.env['PGPASSWORD']!,
      database: process.env['PGDATABASE'] ?? 'postgres',
      ssl: process.env['PGSSLROOTCERT']
        ? { ca: fs.readFileSync(process.env['PGSSLROOTCERT'], 'utf8') }
        : process.env['SUPABASE_CA_CERT']
          ? { ca: process.env['SUPABASE_CA_CERT'] }
          : true,
    }
  : { url: process.env['DATABASE_DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? '' };

export default defineConfig({
  schema:    './src/db/schema.ts',
  out:       './drizzle',
  dialect:   'postgresql',
  dbCredentials,
  verbose:   true,
  strict:    true,
});
