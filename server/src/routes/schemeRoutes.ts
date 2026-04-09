import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// 1. Get all schemes masters
router.get('/masters', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM scheme_masters');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get active enrollments for a customer
router.get('/active/:mobile', async (req, res) => {
    const { mobile } = req.params;
    try {
        const rows = await dbQuery(`
            SELECT cs.*, sm.name as scheme_name, sm.installment_amount, sm.bonus_amount,
                   (SELECT COUNT(*) FROM scheme_payments WHERE customer_scheme_id = cs.id) as installments_paid,
                   (SELECT SUM(amount) FROM scheme_payments WHERE customer_scheme_id = cs.id) as total_saved
            FROM customer_schemes cs
            JOIN scheme_masters sm ON cs.scheme_id = sm.id
            WHERE cs.customer_mobile = ? AND cs.status = 'ACTIVE'
        `, [mobile]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Register for a scheme
router.post('/enroll', async (req, res) => {
    const { customer_name, customer_mobile, scheme_id, start_date } = req.body;
    const account_no = 'SCH-' + Date.now().toString().slice(-6);
    try {
        await dbRun(`
            INSERT INTO customer_schemes (customer_name, customer_mobile, scheme_id, start_date, account_no)
            VALUES (?, ?, ?, ?, ?)
        `, [customer_name, customer_mobile, scheme_id, start_date || new Date().toISOString(), account_no]);
        res.json({ message: 'Enrolled successfully', account_no });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Pay installment
router.post('/pay', async (req, res) => {
    const { customer_scheme_id, amount, installment_no, payment_mode } = req.body;
    const receipt_no = 'RCP-' + Date.now().toString().slice(-6);
    try {
        await dbRun(`
            INSERT INTO scheme_payments (customer_scheme_id, amount, installment_no, payment_mode, receipt_no)
            VALUES (?, ?, ?, ?, ?)
        `, [customer_scheme_id, amount, installment_no, payment_mode, receipt_no]);
        res.json({ message: 'Payment recorded', receipt_no });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get payment history for a scheme
router.get('/payments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await dbQuery('SELECT * FROM scheme_payments WHERE customer_scheme_id = ? ORDER BY created_at DESC', [id]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Search customer scheme accounts
router.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
        const rows = await dbQuery(`
            SELECT cs.*, sm.name as scheme_name, sm.installment_amount
            FROM customer_schemes cs
            JOIN scheme_masters sm ON cs.scheme_id = sm.id
            WHERE cs.customer_mobile LIKE ? OR cs.customer_name LIKE ? OR cs.account_no LIKE ?
            ORDER BY cs.created_at DESC
        `, [`%${q}%`, `%${q}%`, `%${q}%`]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
