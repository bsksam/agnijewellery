import { Router } from 'express';
import { dbQuery, dbGet } from '../db/connection.js';

const router = Router();

// Get dashboard summary stats
router.get('/summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Today's Sales
        const salesStats = await dbGet(`
            SELECT SUM(net_amount) as total_sales 
            FROM sales 
            WHERE date(bill_date) = ?
        `, [today]);

        // 2. Inventory Count
        const inventoryStats = await dbGet(`
            SELECT COUNT(*) as count 
            FROM stock 
            WHERE status = 'AVAILABLE'
        `);

        // 3. Metal Weights (Gold & Silver)
        const metalStats = await dbQuery(`
            SELECT c.name as category, SUM(s.net_weight) as weight
            FROM stock s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE s.status = 'AVAILABLE'
            GROUP BY c.name
        `);

        res.json({
            todaySales: salesStats?.total_sales || 0,
            itemCount: inventoryStats?.count || 0,
            metalSummary: metalStats,
            date: today
        });
    } catch (err: any) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get recent activity (last 10 items added)
router.get('/recent-stock', async (req, res) => {
    try {
        const sql = `
            SELECT s.*, p.name as product_name, c.name as category_name
            FROM stock s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            ORDER BY s.created_at DESC
            LIMIT 10
        `;
        const recent = await dbQuery(sql);
        res.json(recent);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
