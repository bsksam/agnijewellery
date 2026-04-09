import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';

const router = Router();

// Get latest rates for all metals
router.get('/latest', async (req, res) => {
  try {
    const sql = `
      SELECT * FROM daily_rates 
      WHERE date = (SELECT MAX(date) FROM daily_rates)
    `;
    const rates = await dbQuery(sql);
    res.json(rates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update or add a new rate
router.post('/update', async (req, res) => {
  const { metal, purity, rate, action } = req.body;
  if (!metal || !purity || !rate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const sql = `
      INSERT INTO daily_rates (date, metal, purity, selling_rate)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date, metal, purity) DO UPDATE SET selling_rate = excluded.selling_rate
    `;
    await dbRun(sql, [today, metal.toUpperCase(), parseFloat(purity), parseFloat(rate)]);
    res.json({ message: 'Rate updated successfully', date: today });
  } catch (err: any) {
    console.error('Rate Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
