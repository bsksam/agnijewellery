import { Router } from 'express';
import { db, dbQuery, dbGet } from '../db/connection.js';
import { logActivity } from '../services/auditService.js';

const router = Router();

// Create a new Sale
router.post('/sales', async (req, res) => {
  const { 
    customer_name, customer_mobile, items, 
    gross_amount, tax_amount, discount_amount, net_amount, payment_mode, remarks 
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in sale' });
  }

    // Generate a Bill No (simplified)
    const billNo = `INV-${Date.now().toString().slice(-6)}`;
    const user: any = (req as any).user;
    
    // Calculate total weight for the bill
    const totalWeight = items.reduce((sum: number, item: any) => sum + (item.weight || 0), 0);

    try {
      await logActivity(user.id, user.name, 'CREATE', 'SALE', billNo, null, req.body);
      
      // Upsert Customer record for CRM & Tax
      await dbRun(`
        INSERT INTO customers (name, mobile, gstin) 
        VALUES (?, ?, ?) 
        ON CONFLICT(mobile) DO UPDATE SET gstin = excluded.gstin, name = excluded.name
      `, [customer_name, customer_mobile, req.body.customer_gstin || null]);

      const batchCommands = [];

      // 1. Insert Sales Header
      batchCommands.push({
        sql: `
          INSERT INTO sales (bill_no, customer_name, customer_mobile, gross_amount, tax_amount, discount_amount, net_amount, payment_mode, remarks, staff_id, total_weight)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [billNo, customer_name, customer_mobile, gross_amount, tax_amount, discount_amount, net_amount, payment_mode, remarks, user.name, totalWeight]
      });

    // 2. Insert Sales Items & Update Stock
    const itemSql = `
      INSERT INTO sales_items (bill_no, tag_no, product_id, weight, rate, wastage, mc, stone_value, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const updateStockSql = `UPDATE stock SET status = 'SOLD' WHERE tag_no = ?`;

    for (const item of items) {
      batchCommands.push({
        sql: itemSql,
        args: [
          billNo, item.tag_no, item.product_id, item.weight, item.rate, 
          item.wastage || 0, item.mc || 0, item.stone_value || 0, item.total_amount
        ]
      });
      batchCommands.push({
        sql: updateStockSql,
        args: [item.tag_no]
      });
    }

    // Execute everything in a single transactional batch
    await db.batch(batchCommands, 'write');
    
    res.json({ message: 'Sale completed successfully', bill_no: billNo });

  } catch (err: any) {
    console.error('Sale Transaction Error:', err);
    res.status(500).json({ error: 'Transaction failed: ' + err.message });
  }
});

// Get sales history
router.get('/sales', async (req, res) => {
  try {
    const sales = await dbQuery('SELECT * FROM sales ORDER BY bill_date DESC');
    res.json(sales);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single sale details
router.get('/sales/:bill_no', async (req, res) => {
  try {
    const sale = await dbGet('SELECT * FROM sales WHERE bill_no = ?', [req.params.bill_no]);
    if (!sale) return res.status(404).json({ error: 'Invoice not found' });
    
    const items = await dbQuery(`
      SELECT si.*, p.name as product_name, c.name as category_name, s.huid1, s.net_weight as stock_net_weight
      FROM sales_items si
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN stock s ON si.tag_no = s.tag_no
      WHERE si.bill_no = ?
    `, [req.params.bill_no]);
    
    res.json({ ...sale, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
