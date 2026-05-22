import pg from 'pg';

const connectionString = `postgresql://postgres.gezpixodiphbcjegtbti:Xsaz123Xsaz1@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`;

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log("Testing IPv4 Session Pooler (Port 5432)...");
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('🚀 Connection Successful!');
    console.log('Server Time:', res.rows[0].now);
  } catch (err: any) {
    console.error('❌ Connection Failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();