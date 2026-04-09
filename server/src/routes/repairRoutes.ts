import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// 1. Get all active repairs (with search)
router.get('/', async (req, res) => {
    const { search } = req.query;
    try {
        let sql = 'SELECT * FROM repairs WHERE is_cancelled = 0';
        let params: any[] = [];
        
        if (search) {
            sql += ` AND (job_card_no LIKE ? OR customer_name LIKE ? OR customer_mobile LIKE ?)`;
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern, searchPattern];
        }
        
        sql += ' ORDER BY created_at DESC';
        const rows = await dbQuery(sql, params);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create new job card
router.post('/', async (req, res) => {
    const { 
        customer_name, customer_mobile, item_description, 
        repair_details, promised_date, total_charge, advance_paid 
    } = req.body;
    
    const job_card_no = 'JOB-' + Date.now().toString().slice(-6);
    
    try {
        await dbRun(`
            INSERT INTO repairs (
                job_card_no, customer_name, customer_mobile, item_description, 
                repair_details, promised_date, total_charge, advance_paid
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            job_card_no, customer_name, customer_mobile, item_description,
            repair_details, promised_date, total_charge, advance_paid
        ]);
        res.json({ message: 'Repair ticket created', job_card_no });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Update Status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await dbRun('UPDATE repairs SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Deliver & Record Income
router.post('/:id/deliver', async (req, res) => {
    const { id } = req.params;
    try {
        const repair = await dbGet('SELECT * FROM repairs WHERE id = ?', [id]);
        if (!repair) return res.status(404).json({ error: 'Repair not found' });

        const balanceAmount = repair.total_charge - repair.advance_paid;

        // Mark as Delivered
        await dbRun('UPDATE repairs SET status = "DELIVERED" WHERE id = ?', [id]);

        // Record in Accounting (Service Income) - Standard Gold Ledger integration
        try {
            await dbRun(`
                INSERT INTO transactions (date, ledger_id, type, amount, description)
                SELECT julianDay('now'), id, 'INCOME', ?, ?
                FROM ledgers WHERE name = 'Service Charges'
            `, [balanceAmount, `Final payment for JOB: ${repair.job_card_no}`]);
        } catch (accErr) {
            console.error('Accounting entry failed, but repair marked delivered:', accErr);
        }

        res.json({ message: 'Item delivered and payment recorded' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Cancel Job Card
router.patch('/:id/cancel', async (req, res) => {
    const { id } = req.params;
    try {
        await dbRun('UPDATE repairs SET status = "CANCELLED", is_cancelled = 1 WHERE id = ?', [id]);
        res.json({ message: 'Job card cancelled successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Hard Delete (Only if RECEIVED)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const repair = await dbGet('SELECT * FROM repairs WHERE id = ?', [id]);
        if (repair && repair.status === 'RECEIVED') {
            await dbRun('DELETE FROM repairs WHERE id = ?', [id]);
            res.json({ message: 'Repair record deleted' });
        } else {
            res.status(400).json({ error: 'Only RECEIVED repairs can be physically deleted. Use Cancel instead.' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
