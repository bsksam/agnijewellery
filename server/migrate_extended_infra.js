import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function recover() {
    const dbPath = join(__dirname, 'jewel.db');
    console.log(`🚀 Connecting to: ${dbPath}`);
    const db = sqlite3(dbPath);

    try {
        console.log("🏗️ Creating missing 'customers' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                mobile TEXT UNIQUE NOT NULL,
                gstin TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        console.log("🏗️ Creating missing 'customer_schemes' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS customer_schemes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT,
                customer_mobile TEXT,
                scheme_id INTEGER,
                account_no TEXT UNIQUE,
                start_date DATETIME,
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        console.log("🏗️ Creating missing 'scheme_payments' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS scheme_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_scheme_id INTEGER,
                amount REAL,
                installment_no INTEGER,
                payment_mode TEXT,
                receipt_no TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        console.log("🏗️ Creating missing 'repairs' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS repairs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_card_no TEXT UNIQUE,
                customer_name TEXT,
                customer_mobile TEXT,
                item_description TEXT,
                estimated_cost REAL,
                advance_paid REAL,
                status TEXT DEFAULT 'PENDING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        console.log("🏗️ Creating missing 'orders' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_no TEXT UNIQUE,
                customer_name TEXT,
                customer_mobile TEXT,
                order_details TEXT,
                advance_paid REAL,
                status TEXT DEFAULT 'PENDING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        console.log("🛠️ Evolving 'categories' table...");
        try {
            db.prepare("ALTER TABLE categories ADD COLUMN hsn_code TEXT").run();
            console.log("✅ Added hsn_code");
        } catch (e) { console.log("ℹ️ hsn_code exists"); }

        try {
            db.prepare("ALTER TABLE categories ADD COLUMN tax_percent REAL DEFAULT 3.0").run();
            console.log("✅ Added tax_percent");
        } catch (e) { console.log("ℹ️ tax_percent exists"); }

        console.log("🌱 Seeding standard Jewelry HSN codes...");
        const updates = [
            { name: 'GOLD', hsn: '7113', tax: 3.0 },
            { name: 'SILVER', hsn: '7117', tax: 3.0 },
            { name: 'DIAMOND', hsn: '7113', tax: 3.0 },
            { name: 'PLATINUM', hsn: '7113', tax: 3.0 }
        ];

        for (const up of updates) {
            db.prepare("UPDATE categories SET hsn_code = ?, tax_percent = ? WHERE name = ?")
              .run(up.hsn, up.tax, up.name);
        }

        console.log("🎉 Infrastructure Recovery Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Recovery Failed:", err);
        process.exit(1);
    }
}

recover();
