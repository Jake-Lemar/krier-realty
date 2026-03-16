import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

let _db: ReturnType<typeof drizzle> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env['PGHOST'] || process.env['DATABASE_URL']);
}

function buildSsl() {
  const caRaw = process.env['SUPABASE_CA_CERT'];
  const ca = caRaw ? Buffer.from(caRaw, 'base64').toString('utf8') : undefined;
  if (ca) return { ca };
}

function getDb(): ReturnType<typeof drizzle> {
  if (_db) return _db;

  // Prefer individual PG* vars — avoids URL-parsing issues with special chars in passwords
  const poolConfig = process.env['PGHOST']
    ? {
        host:     process.env['PGHOST']!,
        port:     Number(process.env['PGPORT'] ?? 6543),
        user:     process.env['PGUSER']!,
        password: process.env['PGPASSWORD']!,
        database: process.env['PGDATABASE'] ?? 'postgres',
        ssl:      buildSsl(),
        max:      3,
      }
    : {
        connectionString: process.env['DATABASE_URL']!,
        ssl:  buildSsl(),
        max:  3,
      };

  const pool = new Pool(poolConfig);
  _db = drizzle(pool, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});
