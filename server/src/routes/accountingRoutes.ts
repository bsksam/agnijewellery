import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// 1. Daybook (Sales + Expenses)
router.get('/daybook', async (req, res) => {
    const { date } = req.query; // YYYY-MM-DD
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    try {
        const sales = await dbQuery(`
            SELECT 'SALE' as type, bill_no as ref, customer_name as name, net_amount as amount, bill_date as date
            FROM sales 
            WHERE date(bill_date) = ?
        `, [targetDate]);

        const expenses = await dbQuery(`
            SELECT 'EXPENSE' as type, e.description as ref, l.name as name, e.amount as amount, e.exp_date as date
            FROM expenses e
            JOIN ledgers l ON e.ledger_id = l.id
            WHERE date(e.exp_date) = ?
        `, [targetDate]);

        res.json([...sales, ...expenses].sort((a,b) => {
            const dateA = a.date ? new Date(a.date as string).getTime() : 0;
            const dateB = b.date ? new Date(b.date as string).getTime() : 0;
            return dateA - dateB;
        }));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Trial Balance
router.get('/trial-balance', async (req, res) => {
    try {
        // Simple TB: Sum of Sales + Sum of Expenses + Assets
        // Note: For a true TB we use the transactions table, 
        // but for now we aggregate from masters for reliability.
        const salesTotal = await dbGet('SELECT SUM(net_amount) as total FROM sales');
        const taxTotal = await dbGet('SELECT SUM(tax_amount) as total FROM sales');
        const discountTotal = await dbGet('SELECT SUM(discount_amount) as total FROM sales');
        const expenseTotals = await dbQuery(`
            SELECT l.name, SUM(e.amount) as total 
            FROM expenses e 
            JOIN ledgers l ON e.ledger_id = l.id 
            GROUP BY l.name
        `);

        res.json({
            income: [{ name: 'Sales Account', amount: salesTotal?.total || 0 }],
            liabilities: [{ name: 'GST Payable', amount: taxTotal?.total || 0 }],
            expenses: [
                { name: 'Discount Allowed', amount: discountTotal?.total || 0 },
                ...expenseTotals
            ]
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GSTR-1 (Simplified B2C Report)
router.get('/gstr1', async (req, res) => {
    const { month, year } = req.query; // MM, YYYY
    try {
        const sales = await dbQuery(`
            SELECT bill_no, bill_date, customer_name, gross_amount, tax_amount, net_amount
            FROM sales
            WHERE strftime('%m', bill_date) = ? AND strftime('%Y', bill_date) = ?
        `, [month, year]);
        
        res.json(sales);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Expenses CRUD
router.get('/expenses', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT e.*, l.name as ledger_name FROM expenses e JOIN ledgers l ON e.ledger_id = l.id ORDER BY exp_date DESC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/expenses', async (req, res) => {
    const { amount, description, ledger_id, date } = req.body;
    try {
        await dbRun('INSERT INTO expenses (amount, description, ledger_id, exp_date) VALUES (?, ?, ?, ?)', 
            [amount, description, ledger_id, date || new Date().toISOString()]);
        res.json({ message: 'Expense recorded' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ledgers', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM ledgers');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
