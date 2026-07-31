import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.wtrzxqsiidyawcqhahpb:abdo1abdo2abdo3@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=no-verify',
  },
});
