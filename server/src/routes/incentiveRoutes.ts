import { Router } from 'express';
import { db, dbQuery, dbGet } from '../db/connection.js';

const router = Router();

// 1. Get Monthly Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT staff_id, 
                   COUNT(id) as total_sales,
                   SUM(net_amount) as total_value,
                   SUM(total_weight) as total_weight
            FROM sales
            WHERE bill_date >= date('now', 'start of month')
            GROUP BY staff_id
            ORDER BY total_value DESC
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Rules
router.get('/rules', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT cr.*, c.name as category_name
            FROM commission_rules cr
            LEFT JOIN categories c ON cr.category_id = c.id
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create/Update Rule
router.post('/rules', async (req, res) => {
    const { category_id, rule_type, reward_value } = req.body;
    try {
        await dbRun(`
            INSERT INTO commission_rules (category_id, rule_type, reward_value) 
            VALUES (?, ?, ?)
        `, [category_id, rule_type, reward_value]);
        res.json({ message: 'Rule saved' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get My Earnings (For staff)
router.get('/earnings/:staff_id', async (req, res) => {
    const { staff_id } = req.params;
    try {
        // Complex query to calculate rewards per item based on rules
        const rows = await dbQuery(`
            SELECT s.bill_no, s.bill_date, s.net_amount,
                   SUM(
                     CASE 
                       WHEN r.rule_type = 'PERCENT_OF_NET' THEN (si.total_amount * r.reward_value / 100)
                       WHEN r.rule_type = 'PER_GRAM' THEN (si.weight * r.reward_value)
                       ELSE (si.total_amount * 0.005) -- Default 0.5% fallback
                     END
                   ) as estimated_incentive
            FROM sales s
            JOIN sales_items si ON s.bill_no = si.bill_no
            JOIN products p ON si.product_id = p.id
            LEFT JOIN commission_rules r ON p.category_id = r.category_id
            WHERE s.staff_id = ? AND s.bill_date >= date('now', 'start of month')
            GROUP BY s.bill_no
            ORDER BY s.bill_date DESC
        `, [staff_id]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
