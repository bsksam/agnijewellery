import nodemailer from 'nodemailer';
import { dbQuery } from '../db/connection.js';
import { GuardianService } from './guardianService.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Enterprise Backup Engine
 * Gathers 100% of showroom data and delivers to the owner's private inbox.
 */
export const performAutomatedBackup = async (targetEmail: string) => {
  try {
    const tables = [
      'categories', 'products', 'stock', 'sales', 'sales_items', 
      'customers', 'users', 'settings', 'branches', 'stock_transfers',
      'orders', 'schemes', 'dealers', 'repairs', 'activity_logs',
      'quotations', 'quotation_items', 'commission_rules', 'staff_incentives'
    ];

    const fullBackup: any = {};

    for (const table of tables) {
      try {
        const rows = await dbQuery(`SELECT * FROM ${table}`);
        fullBackup[table] = rows;
      } catch (err) {
        console.warn(`Table ${table} skip:`, err);
      }
    }

    const backupContent = JSON.stringify(fullBackup, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `AgniJewellery_Master_Backup_${timestamp}.json`;

    // Generate Executive Intelligence Report
    let executiveReport = '';
    try {
      executiveReport = await GuardianService.generateExecutiveReport();
    } catch (err) {
      console.warn('Executive Report failed:', err);
      executiveReport = '<p>Executive intelligence report currently unavailable.</p>';
    }

    // SMTP Config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password
      },
    });

    const info = await transporter.sendMail({
      from: `"Agni Jewellery Sovereign Control" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `🚨 Agni Executive Business Pulse - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          ${executiveReport}
          <hr style="margin: 30px 0;" />
          <p><strong>Database Status:</strong> Your daily master backup is attached to this email.</p>
          <p><strong>Total Tables Captured:</strong> ${Object.keys(fullBackup).length}</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: backupContent,
        },
      ],
    });

    return { success: true, messageId: info.messageId, fileName };

  } catch (err: any) {
    console.error('Backup Engine Failure:', err);
    throw err;
  }
};
