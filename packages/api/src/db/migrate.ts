/**
 * Database migration script
 * Generates and runs SQL migrations from the Drizzle schema
 *
 * Usage: npm run migrate --workspace=packages/api
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

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
