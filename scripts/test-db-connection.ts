import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
console.log(`Testing connection to: ${connectionString?.replace(/:[^:@]+@/, ":****@")}`);

if (!connectionString) {
    console.error("DATABASE_URL is not defined");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
});

async function test() {
    try {
        const client = await pool.connect();
        console.log("Connected successfully");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0]);
        client.release();
    } catch (e: any) {
        console.error("Connection failed:", e.message);
        if (e.code) console.error("Error code:", e.code);
    } finally {
        await pool.end();
    }
}
test();
