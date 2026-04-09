import { Router } from 'express';
import { dbQuery } from '../db/connection.js';

const router = Router();

// 1. Get All Activity Logs (Admin Only)
router.get('/logs', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT * FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT 500
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Specific Entity Lifecycle
router.get('/lifecycle/:type/:id', async (req, res) => {
    try {
        const rows = await dbQuery(`
            SELECT * FROM activity_logs 
            WHERE entity_type = ? AND entity_id = ?
            ORDER BY created_at DESC
        `, [req.params.type, req.params.id]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
