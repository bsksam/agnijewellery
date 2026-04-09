import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.env.TURSO_DATABASE_URL || `file:${join(__dirname, 'jewel.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const client = createClient({ url, authToken });

async function initRepairs() {
    console.log("🛠️ Initializing Repairs Module Database...");
    
    try {
        // Create Repairs Table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS repairs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_card_no TEXT UNIQUE NOT NULL,
                customer_name TEXT NOT NULL,
                customer_mobile TEXT NOT NULL,
                item_description TEXT NOT NULL,
                repair_details TEXT NOT NULL,
                promised_date DATE,
                total_charge REAL DEFAULT 0,
                advance_paid REAL DEFAULT 0,
                status TEXT DEFAULT 'RECEIVED', -- RECEIVED, PROCESSING, READY, DELIVERED, CANCELLED
                is_cancelled INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Repairs table ready.");

        // Add index for job_card_no
        await client.execute(`CREATE INDEX IF NOT EXISTS idx_job_card ON repairs(job_card_no)`);
        
        console.log("🚀 Database setup for Repairs complete!");
    } catch (err) {
        console.error("❌ Setup failed:", err);
    }
}

initRepairs();
