import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const result = {};

const tables = await pool.query(`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name
`);
result.tables = tables.rows.map(r => r.table_name);

for (const table of ['user', 'account', 'session', 'verification']) {
  const cols = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `, [table]);
  result[table + '_columns'] = cols.rows;
}

// Try simple insert to user table to get the real error
try {
  await pool.query(`INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at) VALUES ('test-id', 'Test', 'testXX@test.com', false, NOW(), NOW())`);
  result.insert_test = 'SUCCESS';
  await pool.query(`DELETE FROM "user" WHERE id = 'test-id'`);
} catch(e) {
  result.insert_test = 'FAILED: ' + e.message;
}

fs.writeFileSync('check_db_output.json', JSON.stringify(result, null, 2));
console.log('Done, check check_db_output.json');
await pool.end();
