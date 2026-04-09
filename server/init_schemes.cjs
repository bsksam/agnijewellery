const { createClient } = require('@libsql/client');
require('dotenv').config();

async function init() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    const sqls = [
        'CREATE TABLE IF NOT EXISTS scheme_masters (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, duration_months INTEGER, installment_amount REAL, bonus_amount REAL)',
        'CREATE TABLE IF NOT EXISTS customer_schemes (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT, customer_mobile TEXT, scheme_id INTEGER, start_date DATE, status TEXT DEFAULT "ACTIVE", account_no TEXT UNIQUE)',
        'CREATE TABLE IF NOT EXISTS scheme_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_scheme_id INTEGER, payment_date DATETIME DEFAULT CURRENT_TIMESTAMP, amount REAL, installment_no INTEGER, payment_mode TEXT, receipt_no TEXT UNIQUE)',
        'INSERT OR IGNORE INTO scheme_masters (name, duration_months, installment_amount, bonus_amount) VALUES ("11+1 Monthly Prosperity", 11, 2000, 2000), ("Savings Gold Plan", 11, 5000, 5000)'
    ];

    for (const sql of sqls) {
        await client.execute(sql);
    }
    console.log('Scheme tables initialized with sample plans');
}

init();
