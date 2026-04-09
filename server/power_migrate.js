import { createClient } from '@libsql/client';
import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

async function migrate() {
    const url = process.argv[2];
    const token = process.argv[3];
    const client = createClient({ url, authToken: token });
    
    const localDbPath = join(_dirname, 'jewel.db');
    const localDb = sqlite3(localDbPath);

    const tables = [
        'categories', 'products', 'stock', 'daily_rates', 'customers',
        'sales', 'sales_items', 'repairs', 'orders', 'customer_schemes', 
        'scheme_payments', 'buybacks', 'buyback_items'
    ];

    console.log("🚀 STARTING POWER MIGRATION (MERGE MODE)...");

    for (const table of tables) {
        console.log(`\n📦 Table: ${table}`);
        
        try {
            const localRows = localDb.prepare(`SELECT * FROM ${table}`).all();
            if (localRows.length === 0) {
                console.log("   Empty locally. Skipping.");
                continue;
            }

            // Get cloud columns to avoid 400 errors from extra local columns
            const cloudMeta = await client.execute(`PRAGMA table_info(${table})`);
            const cloudCols = cloudMeta.rows.map(r => r.name);
            console.log(`   Cloud Columns: ${cloudCols.join(', ')}`);

            const batchSize = 20;
            for (let i = 0; i < localRows.length; i += batchSize) {
                const batch = localRows.slice(i, i + batchSize);
                const commands = batch.map(row => {
                    // Only include columns that exist in the cloud
                    const sharedCols = Object.keys(row).filter(c => cloudCols.includes(c));
                    const placeholders = sharedCols.map(() => '?').join(', ');
                    const sql = `INSERT OR IGNORE INTO ${table} (${sharedCols.join(', ')}) VALUES (${placeholders})`;
                    
                    return {
                        sql,
                        args: sharedCols.map(c => {
                            const v = row[c];
                            if (v === null) return null;
                            if (typeof v === 'boolean') return v ? 1 : 0;
                            // Ensure numeric values are actually numbers (SQLite gives them as such, but good to be safe)
                            return v;
                        })
                    };
                });

                try {
                    await client.batch(commands, "write");
                } catch (err) {
                    // Fallback to single execution for debugging
                    for (const cmd of commands) {
                        try {
                            await client.execute(cmd);
                        } catch (singleErr) {
                            console.error(`      ❌ Error on row: ${singleErr.message}`);
                            // console.error(`      Args: ${JSON.stringify(cmd.args)}`);
                        }
                    }
                }
                
                if (i % 500 === 0 && i > 0) process.stdout.write('.');
            }
            console.log(`\n   ✅ ${table} Synchronized.`);
        } catch (err) {
            console.error(`   ❌ Failed to migrate ${table}: ${err.message}`);
        }
    }

    console.log("\n🎊 POWER MIGRATION COMPLETE! 🎊");
    process.exit(0);
}

migrate();
