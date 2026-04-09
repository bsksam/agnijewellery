import { Router } from 'express';
import { dbRun, dbQuery } from '../db/connection.js';

const router = Router();

// 1. Bulk Import Stock
router.post('/import-stock', async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Invalid data format' });

    try {
        // Simple sequential insertion (for reliability with LibSQL)
        // In a real high-perf scenario, we'd use batching, but for now we ensure data integrity.
        for (const item of items) {
            await dbRun(`
                INSERT OR REPLACE INTO stock (
                    tag_no, product_id, category_name, product_name, 
                    gross_weight, net_weight, wastage_percent, mc_per_gram, 
                    stone_value, hallmark_charges, min_sales_value, status, huid1, huid2
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                item.tag_no, item.product_id, item.category_name, item.product_name,
                item.gross_weight, item.net_weight, item.wastage_percent, item.mc_per_gram,
                item.stone_value, item.hallmark_charges, item.min_sales_value, 'AVAILABLE',
                item.huid1, item.huid2
            ]);
        }
        res.json({ message: `Successfully imported ${items.length} items.` });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Bulk Import Customers
router.post('/import-customers', async (req, res) => {
    const { customers } = req.body;
    try {
        for (const c of customers) {
            await dbRun(`
                INSERT OR IGNORE INTO customers (name, mobile, email, address)
                VALUES (?, ?, ?, ?)
            `, [c.name, c.mobile, c.email, c.address]);
        }
        res.json({ message: `Successfully imported ${customers.length} customers.` });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Universal Export JSON
router.get('/export-all', async (req, res) => {
    try {
        const [stock, sales, customers, ledgers, transactions] = await Promise.all([
            dbQuery('SELECT * FROM stock'),
            dbQuery('SELECT * FROM sales'),
            dbQuery('SELECT * FROM customers'),
            dbQuery('SELECT * FROM ledgers'),
            dbQuery('SELECT * FROM transactions')
        ]);
        res.json({ stock, sales, customers, ledgers, transactions });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
