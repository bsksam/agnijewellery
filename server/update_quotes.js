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
      CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_no TEXT UNIQUE,
        customer_name TEXT,
        customer_mobile TEXT,
        total_amount REAL,
        valid_until DATETIME,
        status TEXT DEFAULT "PENDING",
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER,
        tag_no TEXT,
        product_name TEXT,
        weight REAL,
        rate REAL,
        making_charges REAL,
        stone_charges REAL,
        total REAL
      )
    `);
    console.log('Quotation tables initialized');
  } catch (err) {
    console.error('Update Error:', err);
  }
}

init();
