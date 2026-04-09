const { createClient } = require('@libsql/client');
require('dotenv').config();

async function init() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    const sqls = [
        'CREATE TABLE IF NOT EXISTS ledgers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, group_name TEXT)',
        'CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, tx_date DATETIME DEFAULT CURRENT_TIMESTAMP, ledger_id INTEGER, amount REAL, type TEXT, ref_id TEXT, ref_type TEXT)',
        'CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, exp_date DATETIME DEFAULT CURRENT_TIMESTAMP, amount REAL, description TEXT, ledger_id INTEGER)',
        'INSERT OR IGNORE INTO ledgers (name, group_name) VALUES ("Cash in Hand", "ASSETS"), ("Bank Account", "ASSETS"), ("Sales Income", "INCOME"), ("GST Payable", "LIABILITIES"), ("Discount Allowed", "EXPENSES"), ("Rent", "EXPENSES"), ("Salaries", "EXPENSES"), ("Capital account", "LIABILITIES")'
    ];

    for (const sql of sqls) {
        await client.execute(sql);
    }
    console.log('Accounting tables initialized');
}

init();
