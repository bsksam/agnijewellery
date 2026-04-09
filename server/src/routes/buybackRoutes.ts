import express from 'express';
import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Record a new Buyback / Old Gold Purchase
router.post('/', async (req: any, res) => {
  const { customer_name, customer_mobile, total_weight, total_value, payment_mode, items } = req.body;
  
  // Generate a professional Voucher ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const voucherId = `BB-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // 1. Insert Header
    await db.execute({
      sql: 'INSERT INTO buybacks (id, customer_name, customer_mobile, total_weight, total_value, payment_mode) VALUES (?, ?, ?, ?, ?, ?)',
      args: [voucherId, customer_name, customer_mobile, total_weight, total_value, payment_mode]
    });

    // 2. Insert Items
    for (const item of items) {
      await db.execute({
        sql: 'INSERT INTO buyback_items (buyback_id, karat, weight, purity_percent, rate_applied, value) VALUES (?, ?, ?, ?, ?, ?)',
        args: [voucherId, item.karat, item.weight, item.purity_percent, item.rate_applied, item.value]
      });
    }

    // 3. If Payment Mode is CASH, we might want to log it to accounting or just rely on buybacks table for reporting
    // (In a full ERP, this would hit the Daybook immediately)

    res.json({ success: true, voucherId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record buyback' });
  }
});

// Get Active (Unspent) Credit Vouchers
router.get('/vouchers/active', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM buybacks WHERE payment_mode = "CREDIT" AND status = "ACTIVE" ORDER BY created_at DESC',
      args: []
    });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active vouchers' });
  }
});

// Update Voucher Status (Mark as USED when applied to a bill)
router.patch('/vouchers/:id/use', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute({
      sql: 'UPDATE buybacks SET status = "USED" WHERE id = ?',
      args: [id]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update voucher status' });
  }
});

export default router;
