import { Router } from 'express';
import { dbQuery } from '../db/connection.js';

const router = Router();

// GSTR-1 Aggregator
router.get('/gstr1/:month/:year', async (req, res) => {
    const { month, year } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    try {
        // 1. Sales with Customer Info (B2B check)
        const sales = await dbQuery(`
            SELECT s.bill_no, s.bill_date, s.customer_name, s.customer_mobile, s.net_amount, s.tax_amount, 
                   c.gstin as customer_gstin
            FROM sales s
            LEFT JOIN customers c ON s.customer_mobile = c.mobile
            WHERE s.bill_date >= ? AND s.bill_date <= ?
        `, [startDate, endDate]);

        // 2. HSN Summary (Grouped by Category's real HSN Code)
        const hsnSummary = await dbQuery(`
            SELECT cat.hsn_code, cat.name as category_name,
                   SUM(si.weight) as total_weight,
                   SUM(si.total_amount) as total_value,
                   SUM(si.total_amount * cat.tax_percent / 100) as total_tax
            FROM sales_items si
            JOIN sales s ON si.bill_no = s.bill_no
            JOIN products p ON si.product_id = p.id
            JOIN categories cat ON p.category_id = cat.id
            WHERE s.bill_date >= ? AND s.bill_date <= ?
            GROUP BY cat.hsn_code, cat.name
        `, [startDate, endDate]);

        res.json({
            sales,
            hsnSummary,
            period: { month, year }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
