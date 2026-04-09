import { Router } from 'express';
import { dbQuery, dbGet } from '../db/connection.js';

const router = Router();

// 1. Daily Closing Report
router.get('/daily', async (req, res) => {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
        const stats = await dbQuery(`
            SELECT payment_mode, SUM(net_amount) as total, COUNT(*) as bill_count
            FROM sales
            WHERE date(bill_date) = ?
            GROUP BY payment_mode
        `, [date]);

        const totalItems = await dbGet(`
            SELECT SUM(weight) as total_weight
            FROM sales_items si
            JOIN sales s ON si.bill_no = s.bill_no
            WHERE date(s.bill_date) = ?
        `, [date]);

        res.json({
            date,
            payments: stats,
            totalWeightSold: totalItems?.total_weight || 0,
            grandTotal: stats.reduce((acc: number, curr: any) => acc + curr.total, 0)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Stock Valuation Report
router.get('/valuation', async (req, res) => {
    try {
        // Get current rates for valuation
        const rates = await dbQuery('SELECT * FROM daily_rates');
        const rateMap: any = {};
        rates.forEach((r: any) => rateMap[r.metal] = r.selling_rate);

        const stockSummary = await dbQuery(`
            SELECT c.name as category, COUNT(*) as count, SUM(s.net_weight) as weight
            FROM stock s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE s.status = 'AVAILABLE'
            GROUP BY c.name
        `);

        const valuation = stockSummary.map((group: any) => {
            const rate = rateMap[group.category] || 0;
            return {
                ...group,
                estimatedValue: group.weight * rate
            };
        });

        res.json({
            summary: valuation,
            totalValue: valuation.reduce((acc: number, curr: any) => acc + curr.estimatedValue, 0)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
