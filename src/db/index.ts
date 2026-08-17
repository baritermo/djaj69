import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const DEFAULT_DB_URL = "postgresql://postgres.wtrzxqsiidyawcqhahpb:abdo1abdo2abdo3@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=no-verify";

let databaseUrl = process.env.DATABASE_URL || DEFAULT_DB_URL;

// Automatically route Supabase pooler to transaction mode port 6543 for Serverless / Vercel to prevent EMAXCONNSESSION
if (databaseUrl.includes('.pooler.supabase.com:5432')) {
  databaseUrl = databaseUrl.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 500,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
export * from "./schema";
