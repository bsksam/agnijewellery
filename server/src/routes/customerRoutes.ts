import express from 'express';
import { db } from '../db/connection.js';

const router = express.Router();

/**
 * Agni Ledger - Customer Wealth Portfolio Aggregation
 * Fetches all gold holdings, scheme progress, and exchange credits.
 */
router.get('/portfolio/:phone', async (req, res) => {
  const { phone } = req.params;

  try {
    // 1. Fetch Historical Purchases (Metal Weight)
    const salesQuery = await db.execute({
      sql: `SELECT bi.tag_no, bi.net_weight, bi.purity, b.sale_date, b.net_amount
            FROM billing_items bi
            JOIN billing b ON bi.bill_id = b.id
            JOIN customers c ON b.customer_id = c.id
            WHERE c.phone = ?`,
      args: [phone]
    });

    // 2. Fetch Active Schemes & Installments
    const schemesQuery = await db.execute({
      sql: `SELECT s.scheme_name, s.monthly_amount, s.total_installments, 
                   (SELECT COUNT(*) FROM scheme_installments si WHERE si.scheme_id = s.id) as paid_count,
                   (SELECT SUM(amount) FROM scheme_installments si WHERE si.scheme_id = s.id) as total_paid
            FROM schemes s
            JOIN customers c ON s.customer_id = c.id
            WHERE c.phone = ? AND s.status = 'ACTIVE'`,
      args: [phone]
    });

    // 3. Fetch Old Gold Exchange Credits
    const exchangeQuery = await db.execute({
      sql: `SELECT og.weight, og.purity, b.sale_date
            FROM old_gold_exchanges og
            JOIN billing b ON og.bill_id = b.id
            JOIN customers c ON b.customer_id = c.id
            WHERE c.phone = ?`,
      args: [phone]
    });

    // 4. Fetch Customer Info
    const customerQuery = await db.execute({
      sql: `SELECT name, email, loyalty_points, loyalty_tier FROM customers WHERE phone = ? LIMIT 1`,
      args: [phone]
    });

    const portfolio = {
      customer: customerQuery.rows[0] || null,
      purchases: salesQuery.rows,
      schemes: schemesQuery.rows,
      exchanges: exchangeQuery.rows,
      total_weight: salesQuery.rows.reduce((acc: number, r: any) => acc + (r.net_weight || 0), 0)
    };

    res.json({ success: true, data: portfolio });
  } catch (err) {
    console.error('Portfolio Error', err);
    res.status(500).json({ success: false, message: 'Failed to aggregate portfolio' });
  }
});

export default router;
