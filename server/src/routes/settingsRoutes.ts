import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// Get all settings as a flat object
router.get('/', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM settings');
        const settings: any = {};
        rows.forEach((row: any) => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update multiple settings
router.post('/', async (req, res) => {
    const data = req.body; // { key: value, ... }
    try {
        for (const [key, value] of Object.entries(data)) {
            await dbRun(
                'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
                [key, value]
            );
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
