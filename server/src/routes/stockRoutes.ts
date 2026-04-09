import { Router } from 'express';
import { dbQuery, dbRun, dbGet } from '../db/connection.js';
import { logActivity } from '../services/auditService.js';

const router = Router();

// Get all stock with product and category info
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT s.*, p.name as product_name, c.name as category_name, p.purity as default_purity, b.name as branch_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN branches b ON s.branch_id = b.id
      ORDER BY s.created_at DESC
    `;
    const stock = await dbQuery(sql);
    res.json(stock);
  } catch (err: any) {
    console.error('Fetch Stock Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single tag info for billing
router.get('/:tag_no', async (req, res) => {
  try {
    const sql = `
      SELECT s.*, p.name as product_name, c.name as category_name, p.purity as default_purity,
             COALESCE(s.making_charge_per_gram, p.mc_per_gram) as mc_per_gram,
             COALESCE(s.wastage_percent, p.wastage_percent) as wastage_percent
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.tag_no = ? AND s.status = 'AVAILABLE'
    `;
    const item = await dbGet(sql, [req.params.tag_no]);
    if (!item) {
      return res.status(404).json({ error: 'Tag not found or already sold' });
    }
    res.json(item);
  } catch (err: any) {
    console.error('Fetch Single Tag Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new stock item
router.post('/', async (req, res) => {
  const { 
    tag_no, product_id, gross_weight, net_weight, 
    stone_weight, stone_value, wastage_percent, making_charge_per_gram,
    huid1, huid2, narration, hallmark_charges, touch, min_sales_value,
    wastage_val, mc_total
  } = req.body;

  if (!tag_no || !product_id) {
    return res.status(400).json({ error: 'Tag No and Product ID are required' });
  }

  try {
    // Audit Logging
    const user: any = (req as any).user;
    await logActivity(user.id, user.name, 'CREATE', 'STOCK', tag_no, null, req.body);

    const sql = `
      INSERT INTO stock (
        tag_no, product_id, gross_weight, net_weight, 
        stone_weight, stone_value, wastage_percent, making_charge_per_gram,
        huid1, huid2, narration, hallmark_charges, touch, min_sales_value,
        wastage_val, mc_total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await dbRun(sql, [
      tag_no.toUpperCase(), product_id, gross_weight || 0, net_weight || 0, 
      stone_weight || 0, stone_value || 0, wastage_percent || 0, making_charge_per_gram || 0,
      huid1 || null, huid2 || null, narration || null, hallmark_charges || 0,
      touch || 0, min_sales_value || 0, wastage_val || 0, mc_total || 0
    ]);
    
    res.json({ message: 'Stock added successfully', tag_no });
  } catch (err: any) {
    console.error('Add Stock Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Toggle Public Gallery Status
router.patch('/toggle-gallery/:tag_no', async (req, res) => {
    const { tag_no } = req.params;
    const { show_in_gallery } = req.body;
    try {
        const user: any = (req as any).user;
        await logActivity(user.id, user.name, 'UPDATE', 'STOCK', tag_no, null, { show_in_gallery });
        
        await dbRun('UPDATE stock SET show_in_gallery = ? WHERE tag_no = ?', [show_in_gallery ? 1 : 0, tag_no]);
        res.json({ message: 'Gallery visibility updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
