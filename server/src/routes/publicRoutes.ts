import { Router } from 'express';
import { dbGet, dbQuery, db } from '../db/connection.js';

const router = Router();

// Public route for QR verification
router.get('/verify/:tag_no', async (req, res) => {
    const { tag_no } = req.params;
    try {
        const item = await dbGet(`
            SELECT tag_no, product_name, category_name, net_weight, wastage_percent, huid1, huid2
            FROM stock
            WHERE tag_no = ?
        `, [tag_no.toUpperCase()]);

        if (!item) {
            return res.status(404).json({ error: 'Item not found or certification invalid.' });
        }

        res.json(item);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Public Showroom Catalog
router.get('/showroom', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT s.tag_no, s.product_name, s.category_name, s.gross_weight, s.net_weight, s.status,
                   p.purity as purity_info
            FROM stock s
            JOIN products p ON s.product_id = p.id
            WHERE s.status = 'AVAILABLE' AND s.show_in_gallery = 1
            ORDER BY s.created_at DESC
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Agni Ledger - Public Customer Portfolio
 */
router.get('/portfolio/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const salesRows = await dbQuery(`
      SELECT bi.tag_no, bi.net_weight, b.sale_date, b.net_amount
      FROM billing_items bi
      JOIN billing b ON bi.bill_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.phone = ?
    `, [phone]);

    const schemesRows = await dbQuery(`
      SELECT s.scheme_name, s.monthly_amount, s.total_installments, 
             (SELECT COUNT(*) FROM scheme_installments si WHERE si.scheme_id = s.id) as paid_count,
             (SELECT SUM(amount) FROM scheme_installments si WHERE si.scheme_id = s.id) as total_paid
      FROM schemes s
      JOIN customers c ON s.customer_id = c.id
      WHERE c.phone = ? AND s.status = 'ACTIVE'
    `, [phone]);

    const exchangeRows = await dbQuery(`
      SELECT og.weight, b.sale_date
      FROM old_gold_exchanges og
      JOIN billing b ON og.bill_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.phone = ?
    `, [phone]);

    const customerRows = await dbQuery(`SELECT name, email, loyalty_points, loyalty_tier FROM customers WHERE phone = ? LIMIT 1`, [phone]);

    res.json({
      customer: customerRows[0] || null,
      purchases: salesRows,
      schemes: schemesRows,
      exchanges: exchangeRows,
      total_weight: salesRows.reduce((acc: number, r: any) => acc + (r.net_weight || 0), 0)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
