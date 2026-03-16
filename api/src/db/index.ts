import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

let _db: ReturnType<typeof drizzle> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env['DATABASE_URL']);
}

function getDb(): ReturnType<typeof drizzle> {
  if (_db) return _db;

  const connectionString = process.env['DATABASE_URL']!;

  const pool = new Pool({
    connectionString,
    ssl: process.env['NODE_ENV'] === 'production' ? true : { rejectUnauthorized: false },
    max: 3, // keep pool small for serverless
  });

  _db = drizzle(pool, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});
