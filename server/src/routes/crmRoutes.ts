import { Router } from 'express';
import { dbQuery } from '../db/connection.js';

const router = Router();

// 1. Get upcoming birthdays and anniversaries (next 30 days)
router.get('/upcoming-events', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT id, name, mobile, dob, anniversary_date,
                   (strftime('%j', dob) - strftime('%j', 'now') + 366) % 366 as days_to_birthday,
                   (strftime('%j', anniversary_date) - strftime('%j', 'now') + 366) % 366 as days_to_anniversary
            FROM customers
            WHERE (dob IS NOT NULL AND (strftime('%j', dob) - strftime('%j', 'now') + 366) % 366 <= 30)
               OR (anniversary_date IS NOT NULL AND (strftime('%j', anniversary_date) - strftime('%j', 'now') + 366) % 366 <= 30)
            ORDER BY MIN(
                CASE WHEN dob IS NOT NULL THEN (strftime('%j', dob) - strftime('%j', 'now') + 366) % 366 ELSE 999 END,
                CASE WHEN anniversary_date IS NOT NULL THEN (strftime('%j', anniversary_date) - strftime('%j', 'now') + 366) % 366 ELSE 999 END
            )
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Loyalty Report
router.get('/loyalty-report', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT c.id, c.name, c.mobile, 
                   IFNULL(SUM(s.net_amount), 0) as lifetime_spend,
                   COUNT(s.bill_no) as total_bills,
                   CASE 
                     WHEN IFNULL(SUM(s.net_amount), 0) >= 1000000 THEN 'PLATINUM'
                     WHEN IFNULL(SUM(s.net_amount), 0) >= 100000 THEN 'GOLD'
                     ELSE 'SILVER'
                   END as loyalty_tier
            FROM customers c
            LEFT JOIN sales s ON c.mobile = s.customer_mobile
            GROUP BY c.id
            ORDER BY lifetime_spend DESC
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
