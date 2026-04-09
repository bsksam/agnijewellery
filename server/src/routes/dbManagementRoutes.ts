import { Router } from 'express';
import { dbQuery, db } from '../db/connection.js';
import { createClient } from '@libsql/client';
import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// 1. Get Table Statistics
router.get('/stats', async (req, res) => {
    try {
        const tables = ['stock', 'sales', 'customers', 'repairs', 'transactions', 'schemes'];
        const stats: Record<string, number> = {};
        
        for (const table of tables) {
            try {
                const result = await dbQuery(`SELECT COUNT(*) as count FROM ${table}`);
                stats[table] = (result[0] as any).count;
            } catch (e) {
                stats[table] = 0; // Table might not exist yet
            }
        }
        
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Cloud Sync (Push Local to Turso)
router.post('/sync', async (req, res) => {
    const { url, token, overwrite } = req.body;
    
    if (!url || !token) {
        return res.status(400).json({ error: 'Missing Cloud Target (URL/Token)' });
    }

    try {
        console.log("🚀 Starting Cloud Porting API Request...");
        const cloudDb = createClient({ url, authToken: token });
        const localDbPath = join(__dirname, '../../../jewel.db');
        const localDb = sqlite3(localDbPath);

        // Core migration logic (Simplified Batching)
        const tablesToSync = ['categories', 'products', 'stock', 'customers', 'repairs', 'sales', 'sales_items'];
        let log: string[] = ["Initialized cloud connection.", "Opened local DB."];

        for (const table of tablesToSync) {
            log.push(`Syncing table: ${table}...`);
            const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
            
            if (rows.length === 0) continue;

            const batchSize = 100;
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const commands = batch.map((row: any) => {
                    const columns = Object.keys(row).join(', ');
                    const placeholders = Object.keys(row).map(() => '?').join(', ');
                    const values = Object.values(row);
                    
                    return {
                        sql: `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`,
                        args: values
                    };
                });
                await cloudDb.batch(commands, "write");
            }
            log.push(`Successfully ported ${rows.length} records for ${table}.`);
        }

        res.json({ message: 'Universal Cloud Porting Complete', log });
    } catch (err: any) {
        res.status(500).json({ error: 'Migration Failed: ' + err.message });
    }
});

// 3. DB Health Check
router.get('/health', async (req, res) => {
    try {
        const issues: string[] = [];
        
        // Check for orphaned sales items
        const orphanedItems = await dbQuery('SELECT COUNT(*) as count FROM sales_items WHERE bill_no NOT IN (SELECT bill_no FROM sales)');
        if ((orphanedItems[0] as any).count > 0) {
            issues.push(`${(orphanedItems[0] as any).count} orphaned sales items found.`);
        }

        // Check for missing customers referenced in sales
        const missingCustomers = await dbQuery('SELECT COUNT(*) as count FROM sales WHERE customer_mobile NOT IN (SELECT mobile FROM customers) AND customer_mobile IS NOT NULL');
        if ((missingCustomers[0] as any).count > 0) {
            issues.push(`${(missingCustomers[0] as any).count} sales references unindexed customers.`);
        }

        res.json({ status: issues.length === 0 ? 'Healthy' : 'Degraded', issues });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
