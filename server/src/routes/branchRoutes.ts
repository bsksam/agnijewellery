import { Router } from 'express';
import { db, dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// 1. Get all branches
router.get('/', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM branches ORDER BY name ASC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create new branch
router.post('/', async (req, res) => {
    const { name, type, address, code } = req.body;
    try {
        await dbRun('INSERT INTO branches (name, type, address, code) VALUES (?, ?, ?, ?)', [name, type, address, code]);
        res.json({ message: 'Branch registered' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Initiate Transfer
router.post('/transfer', async (req, res) => {
    const { tag_no, to_branch_id, transferred_by } = req.body;
    try {
        const item = await dbGet('SELECT branch_id FROM stock WHERE tag_no = ?', [tag_no]);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        const from_branch_id = item.branch_id;

        // Create transfer record
        await dbRun(`
            INSERT INTO stock_transfers (tag_no, from_branch_id, to_branch_id, status, transferred_by)
            VALUES (?, ?, ?, 'PENDING', ?)
        `, [tag_no, from_branch_id, to_branch_id, transferred_by]);

        // Mark stock as 'IN_TRANSIT'
        await dbRun('UPDATE stock SET status = "IN_TRANSIT" WHERE tag_no = ?', [tag_no]);

        res.json({ message: 'Transfer initiated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Accept Transfer
router.post('/accept/:id', async (req, res) => {
    const { id } = req.params;
    const { received_by } = req.body;
    try {
        const transfer = await dbGet('SELECT * FROM stock_transfers WHERE id = ?', [id]);
        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

        const batch = [
            {
                sql: 'UPDATE stock_transfers SET status = "ACCEPTED", received_by = ?, received_at = CURRENT_TIMESTAMP WHERE id = ?',
                args: [received_by, id]
            },
            {
                sql: 'UPDATE stock SET branch_id = ?, status = "AVAILABLE" WHERE tag_no = ?',
                args: [transfer.to_branch_id, transfer.tag_no]
            }
        ];

        await db.batch(batch, 'write');
        res.json({ message: 'Stock received and updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get My Branch Transfers (Pending)
router.get('/transfers/:branch_id', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT t.*, b.name as from_branch_name, s.product_name, s.gross_weight
            FROM stock_transfers t
            JOIN branches b ON t.from_branch_id = b.id
            JOIN stock s ON t.tag_no = s.tag_no
            WHERE t.to_branch_id = ? AND t.status = 'PENDING'
        `, [req.params.branch_id]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
