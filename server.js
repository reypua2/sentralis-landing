const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection — Railway provides DATABASE_URL automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database table
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        signed_up_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Waitlist table ready');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

// POST /api/waitlist — save email
app.post('/api/waitlist', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  try {
    await pool.query(
      'INSERT INTO waitlist (email, name) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [email.toLowerCase().trim(), name || null]
    );
    res.json({ success: true, message: 'Added to waitlist' });
  } catch (err) {
    console.error('Insert error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/waitlist/count — live counter
app.get('/api/waitlist/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM waitlist');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// GET /api/waitlist — view all signups (protect this in production)
app.get('/api/waitlist', async (req, res) => {
  const secret = req.query.secret;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query('SELECT * FROM waitlist ORDER BY signed_up_at DESC');
    res.json({ count: result.rows.length, signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve index.html from public folder
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Sentralis landing running on port ${PORT}`));
});
