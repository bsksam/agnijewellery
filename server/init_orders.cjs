const { createClient } = require('@libsql/client');
require('dotenv').config();

async function init() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    const sqls = [
        'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_no TEXT UNIQUE, customer_name TEXT, customer_mobile TEXT, description TEXT, expected_weight REAL, purity TEXT, gold_rate_fixed REAL, delivery_date DATE, status TEXT DEFAULT "PENDING", created_at DATETIME DEFAULT CURRENT_TIMESTAMP)',
        'CREATE TABLE IF NOT EXISTS order_advances (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, amount REAL, payment_mode TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
    ];

    for (const sql of sqls) {
        await client.execute(sql);
    }
    console.log('Order tables initialized');
}

init();
