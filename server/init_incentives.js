import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function init() {
    const dbPath = join(__dirname, 'jewel.db');
    console.log(`🚀 Connecting to: ${dbPath}`);
    const db = sqlite3(dbPath);

    try {
        console.log("🛠️ Adding new columns to 'sales' table...");
        try {
            db.prepare("ALTER TABLE sales ADD COLUMN staff_id TEXT").run();
            console.log("✅ Added staff_id");
        } catch (e) {
            console.log("ℹ️ staff_id already exists or error: " + e.message);
        }

        try {
            db.prepare("ALTER TABLE sales ADD COLUMN total_weight REAL DEFAULT 0").run();
            console.log("✅ Added total_weight");
        } catch (e) {
            console.log("ℹ️ total_weight already exists or error: " + e.message);
        }

        console.log("🏗️ Creating 'commission_rules' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS commission_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER,
                rule_type TEXT NOT NULL, -- PERCENT_OF_NET, PER_GRAM
                reward_value REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Seed some initial rules if empty
        const count = db.prepare("SELECT COUNT(*) as count FROM commission_rules").get().count;
        if (count === 0) {
            console.log("🌱 Seeding initial reward rules...");
            const cats = db.prepare("SELECT id, name FROM categories").all();
            for (const cat of cats) {
                let reward = 0.5; // Default 0.5%
                if (cat.name === 'DIAMOND') reward = 2.0;
                if (cat.name === 'PLATINUM') reward = 1.0;
                
                db.prepare("INSERT INTO commission_rules (category_id, rule_type, reward_value) VALUES (?, ?, ?)")
                  .run(cat.id, 'PERCENT_OF_NET', reward);
            }
            console.log("✅ Rules seeded.");
        }

        console.log("🎉 Database Evolution Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Evolution Failed:", err);
        process.exit(1);
    }
}

init();
