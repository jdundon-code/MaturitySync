/**
 * Database migration script
 * Generates and runs SQL migrations from the Drizzle schema
 *
 * Usage: npm run migrate --workspace=packages/api
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

// Load .env file (check local, then root)
function loadEnv() {
  const paths = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      const lines = readFileSync(p, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key && !process.env[key]) {
          process.env[key] = rest.join('=');
        }
      }
      break;
    }
  }
}
loadEnv();

const { Pool } = pg;

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/maturitysync';
  
  console.log('🔄 Running migrations...');
  console.log(`   Database: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);
  
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations complete.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
