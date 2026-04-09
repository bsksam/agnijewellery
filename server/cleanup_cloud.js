import { createClient } from '@libsql/client';

async function cleanup() {
    const url = process.argv[2];
    const token = process.argv[3];
    const client = createClient({ url, authToken: token });

    console.log("🔥 DROPPING MISMATCHED TABLES...");
    const tables = ['sales_items', 'sales', 'stock', 'products', 'categories'];
    
    for (const table of tables) {
        try {
            await client.execute(`DROP TABLE IF EXISTS ${table}`);
            console.log(`🗑️  Dropped ${table}`);
        } catch (err) {
            console.error(`❌ Failed to drop ${table}: ${err.message}`);
        }
    }
    console.log("✅ Cleanup Finished.");
    process.exit(0);
}

cleanup();
