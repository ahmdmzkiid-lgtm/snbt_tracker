import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

console.log('🔴 Dropping old auth tables...');
// Drop in order (reverse of FK dependencies)
await pool.query(`DROP TABLE IF EXISTS "session" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "account" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "verification" CASCADE`);
// NOTE: We do NOT drop "user" table if it has app data FK references
// Instead, re-create it preserving FK refs. Drop profiles etc first if needed.
await pool.query(`DROP TABLE IF EXISTS "user_progress" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "tryouts" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "error_logs" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "study_sessions" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "profiles" CASCADE`);
await pool.query(`DROP TABLE IF EXISTS "user" CASCADE`);

console.log('✅ Done! Now run: npm run db:push');
await pool.end();
