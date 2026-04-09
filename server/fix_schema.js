import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO env vars");
    process.exit(1);
}

const client = createClient({ url, authToken });

async function fixSchema() {
    console.log("🛠️ Starting Schema Fix...");
    
    try {
        // 1. Standardize daily_rates
        console.log("Fixing daily_rates...");
        await client.execute(`DROP TABLE IF EXISTS daily_rates`);
        await client.execute(`
            CREATE TABLE daily_rates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                metal TEXT NOT NULL,
                purity REAL NOT NULL,
                selling_rate REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, metal, purity)
            )
        `);

        // 2. Enhance stock table
        console.log("Enhancing stock table...");
        const columns = [
            "huid1 TEXT",
            "huid2 TEXT",
            "narration TEXT",
            "hallmark_charges REAL DEFAULT 0",
            "touch REAL DEFAULT 0",
            "min_sales_value REAL DEFAULT 0",
            "wastage_val REAL DEFAULT 0",
            "mc_total REAL DEFAULT 0"
        ];

        for (const col of columns) {
            try {
                await client.execute(`ALTER TABLE stock ADD COLUMN ${col}`);
                console.log(`Added column: ${col}`);
            } catch (e) {
                console.log(`Column ${col.split(' ')[0]} might already exist, skipping...`);
            }
        }

        console.log("✅ Schema Fix Completed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Fix Failed:", err);
        process.exit(1);
    }
}

fixSchema();
