import { Router } from 'express';
import { dbQuery, dbRun } from '../db/connection.js';

const router = Router();

// --- Categories ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbQuery('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  const { name, description, hsn_code, tax_percent } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = await dbRun(
      'INSERT INTO categories (name, description, hsn_code, tax_percent) VALUES (?, ?, ?, ?)', 
      [name.toUpperCase(), description, hsn_code, tax_percent || 3.0]
    );
    res.json({ id: result.id, name, description, hsn_code, tax_percent });
  } catch (err: any) {
    console.error('Category Save Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Products ---
router.get('/products', async (req, res) => {
  try {
    const sql = `
      SELECT p.*, c.name as category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.name
    `;
    const products = await dbQuery(sql);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  const { category_id, name, purity, mc_per_gram, wastage_percent } = req.body;
  if (!category_id || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await dbRun(
      'INSERT INTO products (category_id, name, purity, mc_per_gram, wastage_percent) VALUES (?, ?, ?, ?, ?)',
      [category_id, name.toUpperCase(), purity, mc_per_gram || 0, wastage_percent || 0]
    );
    res.json({ id: result.id, name });
  } catch (err: any) {
    console.error('Product Save Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
