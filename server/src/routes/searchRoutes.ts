import { Router } from 'express';
import { dbQuery } from '../db/connection.js';

const router = Router();

// Universal Search
router.get('/universal', async (req, res) => {
    const { q } = req.query;
    if (!q || String(q).length < 2) return res.json([]);

    const query = `%${q}%`;

    try {
        // We use multiple queries to keep the schema simple and fast
        const [stock, customers, sales] = await Promise.all([
            dbQuery(`
                SELECT 'STOCK' as type, tag_no as id, (product_name || ' (' || category_name || ')') as title, status as subtitle
                FROM stock 
                WHERE tag_no LIKE ? OR product_name LIKE ?
                LIMIT 5
            `, [query, query]),
            dbQuery(`
                SELECT 'CUSTOMER' as type, mobile as id, name as title, mobile as subtitle
                FROM customers
                WHERE name LIKE ? OR mobile LIKE ?
                LIMIT 5
            `, [query, query]),
            dbQuery(`
                SELECT 'BILL' as type, bill_no as id, ('Invoice ' || bill_no) as title, customer_name as subtitle
                FROM sales
                WHERE bill_no LIKE ? OR customer_name LIKE ?
                LIMIT 5
            `, [query, query])
        ]);

        const results = [...stock, ...customers, ...sales];
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
