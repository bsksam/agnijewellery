import { Router } from 'express';
import { db, dbQuery, dbGet } from '../db/connection.js';

const router = Router();

// 1. Create a Quotation
router.post('/', async (req, res) => {
    const { 
        customer_name, customer_mobile, items, 
        total_amount, valid_hours 
    } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in quotation' });
    }

    const quoteNo = `EST-${Date.now().toString().slice(-6)}`;
    const validUntil = new Date(Date.now() + (valid_hours || 24) * 60 * 60 * 1000).toISOString();

    try {
        const batchCommands = [];

        // Insert Header
        batchCommands.push({
            sql: `
                INSERT INTO quotations (quote_no, customer_name, customer_mobile, total_amount, valid_until)
                VALUES (?, ?, ?, ?, ?)
            `,
            args: [quoteNo, customer_name, customer_mobile, total_amount, validUntil]
        });

        // Get the last ID (simplified approach for batch)
        // Note: In LibSQL batch, we can't easily get lastInsertRowid mid-batch without complexity.
        // We'll insert items as many separate records linked by quote_no instead if needed, 
        // but let's assume we can link them later or use a different approach.
        // Better way: Separate calls if not using a unified transaction for linked IDs.
        
        const result = await db.execute({
            sql: `INSERT INTO quotations (quote_no, customer_name, customer_mobile, total_amount, valid_until)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [quoteNo, customer_name, customer_mobile, total_amount, validUntil]
        });
        
        const quoteId = Number(result.lastInsertRowid);

        for (const item of items) {
            await db.execute({
                sql: `INSERT INTO quotation_items (quote_id, tag_no, product_name, weight, rate, making_charges, stone_charges, total)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [quoteId, item.tag_no, item.product_name, item.weight, item.rate, item.making_charges, item.stone_charges, item.total]
            });
        }
        
        res.json({ message: 'Quotation created successfully', quote_no: quoteNo });

    } catch (err: any) {
        res.status(500).json({ error: 'Quotation failed: ' + err.message });
    }
});

// 2. Get All Quotations
router.get('/', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM quotations ORDER BY created_at DESC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Single Quotation
router.get('/:id', async (req, res) => {
    try {
        const quote = await dbGet('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
        if (!quote) return res.status(404).json({ error: 'Quotation not found' });
        
        const items = await dbQuery('SELECT * FROM quotation_items WHERE quote_id = ?', [req.params.id]);
        res.json({ ...quote, items });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
