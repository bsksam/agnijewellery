import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function init() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS commission_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        rule_type TEXT,
        reward_value REAL,
        is_active INTEGER DEFAULT 1
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS staff_incentives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT,
        sale_id INTEGER,
        amount REAL,
        month_period TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.execute(`
      INSERT OR IGNORE INTO commission_rules (id, category_id, rule_type, reward_value) 
      VALUES (1, 1, 'PERCENT_OF_NET', 0.5)
    `);
    console.log('Staff Incentive tables initialized');
  } catch (err) {
    console.error('Update Error:', err);
  }
}

init();
