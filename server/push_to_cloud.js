import { createClient } from '@libsql/client';
import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Manual migration script to push LOCAL sqlite data to TURSO Cloud (with MERGE logic)
// Usage: node push_to_cloud.js <TURSO_URL> <TURSO_TOKEN>

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

async function push() {
    const url = process.argv[2];
    const token = process.argv[3];

    if (!url || !token) {
        console.error("Usage: node push_to_cloud.js <TURSO_URL> <TURSO_TOKEN>");
        process.exit(1);
    }

    console.log("🚀 Initializing Cloud Connection...");
    const cloudDb = createClient({ url, authToken: token });
    
    console.log("📂 Opening Local Database...");
    const localDbPath = join(_dirname, 'jewel.db');
    const localDb = sqlite3(localDbPath);

    try {
        const tablesToMigrate = [
            'categories', 'products', 'stock', 'daily_rates', 
            'sales', 'sales_items', 'customers', 'repairs', 'orders', 
            'customer_schemes', 'scheme_payments', 'commission_rules', 
            'buybacks', 'buyback_items', 'users'
        ];

        for (const table of tablesToMigrate) {
            console.log(`📦 Processing Table: ${table}...`);
            
            // Check if table exists locally
            const tableCheck = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
            if (!tableCheck) {
                console.log(`⚠️  Table ${table} not found in local DB. Skipping.`);
                continue;
            }

            const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
            if (rows.length === 0) {
                console.log(`ℹ️  Table ${table} is empty. Skipping.`);
                continue;
            }

            console.log(`📤 Uploading ${rows.length} rows to ${table}...`);
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const colNames = columns.join(', ');
            
            // Using INSERT OR IGNORE for simpler MERGE logic
            const sql = `INSERT OR IGNORE INTO ${table} (${colNames}) VALUES (${placeholders})`;

            const batchSize = 25; // Smaller batch for better error isolation
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const commands = batch.map(row => ({
                    sql,
                    args: columns.map(col => {
                        const val = row[col];
                        // Handle booleans/nulls correctly for LibSQL
                        if (val === null) return null;
                        if (typeof val === 'boolean') return val ? 1 : 0;
                        return val;
                    })
                }));

                try {
                    await cloudDb.batch(commands, "write");
                } catch (batchErr) {
                    console.warn(`   ⚠️  Batch failed at row ${i}. Retrying row-by-row...`);
                    for (const cmd of commands) {
                        try {
                            await cloudDb.execute(cmd);
                        } catch (singleErr) {
                            console.error(`      ❌ Row Failed: ${singleErr.message}`);
                            console.error(`      SQL: ${cmd.sql}`);
                            console.error(`      Args: ${JSON.stringify(cmd.args)}`);
                        }
                    }
                }
                
                if (i % 500 === 0 && i > 0) console.log(`   Progress: ${i} rows processed...`);
            }
            console.log(`✅ Table ${table} synchronized.`);
        }

        console.log("\n✨ CLOUD SYNCHRONIZATION COMPLETE! ✨");
        console.log("Your data has been MERGED with the production environment.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

push();
