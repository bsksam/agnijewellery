import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// 1. Get all orders with their total advances
router.get('/', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT o.*, 
                   (SELECT SUM(amount) FROM order_advances WHERE order_id = o.id) as total_advance
            FROM orders o
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create new order
router.post('/', async (req, res) => {
    const { 
        customer_name, customer_mobile, description, 
        expected_weight, purity, gold_rate_fixed, delivery_date 
    } = req.body;
    
    // Generate simple order number
    const order_no = 'ORD-' + Date.now().toString().slice(-6);

    try {
        const result = await dbRun(`
            INSERT INTO orders (order_no, customer_name, customer_mobile, description, expected_weight, purity, gold_rate_fixed, delivery_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [order_no, customer_name, customer_mobile, description, expected_weight, purity, gold_rate_fixed, delivery_date]);

        res.json({ message: 'Order created', order_no, id: (result as any).id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Add advance to an order
router.post('/:id/advance', async (req, res) => {
    const { id } = req.params;
    const { amount, payment_mode } = req.body;
    try {
        await dbRun(`
            INSERT INTO order_advances (order_id, amount, payment_mode)
            VALUES (?, ?, ?)
        `, [id, amount, payment_mode]);

        res.json({ message: 'Advance recorded successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update order status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
