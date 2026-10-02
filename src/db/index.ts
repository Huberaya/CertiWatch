import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.ts';

// Connection URL from Neon
const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  '';

export const isNeonConfigured = Boolean(connectionString && connectionString.startsWith('postgres'));

declare global {
  var _neonPool: Pool | undefined;
}

export function createNeonPool() {
  if (!connectionString) {
    return null;
  }
  if (!global._neonPool) {
    global._neonPool = new Pool({
      connectionString,
      max: 10,
    });
    global._neonPool.on('error', (err: any) => {
      console.error('Neon serverless pool idle client error:', err);
    });
  }
  return global._neonPool;
}

const pool = createNeonPool();

export const db = pool ? drizzle(pool, { schema }) : null;

export async function checkNeonHealth() {
  if (!pool || !db) {
    return {
      connected: false,
      reason: 'DATABASE_URL ou NEON_DATABASE_URL non renseigné dans .env',
      latencyMs: null,
      provider: 'Neon Serverless PostgreSQL (Drizzle ORM)',
    };
  }

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name, version()');
      const latencyMs = Date.now() - start;
      return {
        connected: true,
        latencyMs,
        database: res.rows[0]?.db_name,
        neonTimestamp: res.rows[0]?.current_time,
        provider: 'Neon Serverless PostgreSQL (Drizzle ORM)',
      };
    } finally {
      client.release();
    }
  } catch (error: any) {
    return {
      connected: false,
      reason: error.message || 'Erreur de connexion Neon',
      latencyMs: Date.now() - start,
      provider: 'Neon Serverless PostgreSQL (Drizzle ORM)',
    };
  }
}
