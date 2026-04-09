import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import Routes
import rateRoutes from './routes/rateRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import billingRoutes from './routes/billingRoutes.js';

import dashboardRoutes from './routes/dashboardRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import accountingRoutes from './routes/accountingRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dealerRoutes from './routes/dealerRoutes.js';
import bulkRoutes from './routes/bulkRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import taxRoutes from './routes/taxRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import incentiveRoutes from './routes/incentiveRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import dbManagementRoutes from './routes/dbManagementRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import buybackRoutes from './routes/buybackRoutes.js';
import { authenticate, authorize } from './middleware/authMiddleware.js';

dotenv.config();

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const app = express();
export default app;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Publicly accessible routes (No Auth)
app.use('/api/public', publicRoutes);

// Main Routes
app.use('/api/auth', authRoutes);

app.use('/api/rates', authenticate, authorize(['ADMIN']), rateRoutes);
app.use('/api/master', authenticate, authorize(['ADMIN']), masterRoutes);
app.use('/api/stock', authenticate, stockRoutes);
app.use('/api/billing', authenticate, billingRoutes);
app.use('/api/customers', authenticate, customerRoutes);
app.use('/api/settings', authenticate, authorize(['ADMIN']), settingsRoutes);
app.use('/api/reports', authenticate, authorize(['ADMIN']), reportRoutes);
app.use('/api/buyback', authenticate, buybackRoutes);
app.use('/api/quotations', authenticate, quotationRoutes);
app.use('/api/accounting', authenticate, authorize(['ADMIN']), accountingRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/schemes', authenticate, schemeRoutes);
app.use('/api/analytics', authenticate, authorize(['ADMIN']), analyticsRoutes);
app.use('/api/dealers', authenticate, authorize(['ADMIN']), dealerRoutes);
app.use('/api/bulk', authenticate, authorize(['ADMIN']), bulkRoutes);
app.use('/api/repairs', authenticate, repairRoutes);
app.use('/api/crm', authenticate, authorize(['ADMIN']), crmRoutes);
app.use('/api/branches', authenticate, branchRoutes);
app.use('/api/tax', authenticate, authorize(['ADMIN']), taxRoutes);
app.use('/api/quotations', authenticate, quotationRoutes);
app.use('/api/incentives', authenticate, incentiveRoutes);
app.use('/api/backup', authenticate, authorize(['ADMIN']), backupRoutes);
app.use('/api/db', authenticate, authorize(['ADMIN']), dbManagementRoutes);
app.use('/api/audit', authenticate, authorize(['ADMIN']), auditRoutes);
app.use('/api/search', authenticate, searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JewelTest API is running' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
