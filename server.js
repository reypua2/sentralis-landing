const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        signed_up_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Database ready');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    await pool.query('INSERT INTO waitlist (email) VALUES ($1)', [email]);
    res.json({ success: true, message: 'You are on the list!' });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Already signed up!' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

app.get('/api/waitlist/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM waitlist');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.json({ count: 0 });
  }
});

app.get('/api/waitlist', async (req, res) => {
  if (req.query.secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query('SELECT * FROM waitlist ORDER BY signed_up_at DESC');
    res.json({ count: result.rows.length, signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log('Sentralis running on port ' + PORT));
});
