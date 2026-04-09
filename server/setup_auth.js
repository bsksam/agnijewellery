import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function setupAuth() {
    console.log("🔐 Setting up Role-Based Authentication...");
    
    try {
        // 1. Create Users Table
        console.log("Creating users table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('ADMIN', 'STAFF')),
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Clear existing users (if any) to avoid conflicts during seed
        // await client.execute("DELETE FROM users");

        // 3. Generate Hashes
        const adminHash = await bcrypt.hash('admin123', 10);
        const staffHash = await bcrypt.hash('staff123', 10);

        // 4. Seed Users
        console.log("Seeding initial users...");
        await client.execute({
            sql: "INSERT OR IGNORE INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)",
            args: ['admin', adminHash, 'ADMIN', 'Store Owner']
        });

        await client.execute({
            sql: "INSERT OR IGNORE INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)",
            args: ['staff', staffHash, 'STAFF', 'Sales Counter']
        });

        console.log("✅ Auth Setup Completed!");
        console.log("-----------------------------------");
        console.log("Admin: admin / admin123");
        console.log("Staff: staff / staff123");
        console.log("-----------------------------------");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Auth Setup Failed:", err);
        process.exit(1);
    }
}

setupAuth();
