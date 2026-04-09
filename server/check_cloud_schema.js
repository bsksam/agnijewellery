import { createClient } from '@libsql/client';

async function check() {
    const url = process.argv[2];
    const token = process.argv[3];
    const client = createClient({ url, authToken: token });

    console.log("🔍 INSPECTING CLOUD STOCK SCHEMA...");
    const r = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='stock'");
    console.log(r.rows[0].sql);
    process.exit(0);
}

check();
