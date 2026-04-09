import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// 1. Get all dealers with their current metal balance
router.get('/', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT d.*, 
                   IFNULL((SELECT SUM(CASE WHEN type = 'ISSUE' THEN weight ELSE -weight END) 
                    FROM metal_transactions WHERE dealer_id = d.id), 0) + d.opening_metal_balance as current_balance
            FROM dealers d
            ORDER BY d.name ASC
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create new dealer
router.post('/', async (req, res) => {
    const { name, mobile, address, opening_metal_balance } = req.body;
    try {
        await dbRun(`
            INSERT INTO dealers (name, mobile, address, opening_metal_balance)
            VALUES (?, ?, ?, ?)
        `, [name, mobile, address, opening_metal_balance || 0]);
        res.json({ message: 'Dealer registered' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get dealer ledger
router.get('/ledger/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await dbQuery(`
            SELECT * FROM metal_transactions 
            WHERE dealer_id = ? 
            ORDER BY tx_date DESC
        `, [id]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Record metal transaction
router.post('/transaction', async (req, res) => {
    const { dealer_id, metal_type, weight, type, description } = req.body;
    try {
        await dbRun(`
            INSERT INTO metal_transactions (dealer_id, metal_type, weight, type, description)
            VALUES (?, ?, ?, ?, ?)
        `, [dealer_id, metal_type, weight, type, description]);
        res.json({ message: 'Transaction recorded' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
