import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function expandSchema() {
    console.log("🛠️ Expanding Schema for CRM & Settings...");
    
    try {
        // 1. Customers Table
        console.log("Creating customers table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                mobile TEXT UNIQUE NOT NULL,
                address TEXT,
                gstin TEXT,
                anniversary DATE,
                birthday DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Settings Table (Key-Value)
        console.log("Creating settings table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `);

        // 3. Insert Default Settings
        console.log("Inserting default shop settings...");
        const defaultSettings = [
            ['shop_name', 'AGNI JEWELLERY'],
            ['shop_address', '123 Jewel Lane, Gold Bazaar, Chennai, TN - 600001'],
            ['shop_phone', '+91 98765 43210'],
            ['shop_gstin', '33AAAAA0000A1Z5'],
            ['invoice_terms', '1. Goods once sold will not be taken back. 2. Subject to local jurisdiction.']
        ];

        for (const [key, val] of defaultSettings) {
            await client.execute({
                sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                args: [key, val]
            });
        }

        // 4. Initial Migration: Populate customers from existing sales
        console.log("Migrating existing customers from sales history...");
        await client.execute(`
            INSERT OR IGNORE INTO customers (name, mobile)
            SELECT DISTINCT customer_name, customer_mobile 
            FROM sales 
            WHERE customer_mobile IS NOT NULL AND customer_mobile != ''
        `);

        console.log("✅ Final Schema Expansion Completed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Expansion Failed:", err);
        process.exit(1);
    }
}

expandSchema();
