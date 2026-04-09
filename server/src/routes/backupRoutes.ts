import { Router } from 'express';
import { performAutomatedBackup } from '../services/backupService.js';

const router = Router();

// 1. Manual Backup Trigger (Direct Email)
router.post('/trigger', async (req, res) => {
    try {
        const ownerEmail = process.env.OWNER_EMAIL || 'bsksam@gmail.com';
        const result = await performAutomatedBackup(ownerEmail);
        res.json({ message: 'Backup delivered to your inbox!', result });
    } catch (err: any) {
        res.status(500).json({ error: 'Backup delivery failed. Please check SMTP settings. ' + err.message });
    }
});

// 2. Health Status
router.get('/status', async (req, res) => {
    res.json({ 
        status: 'Operational', 
        target: 'bsksam@gmail.com',
        scheduled: 'Daily 11:00 PM'
    });
});

export default router;
