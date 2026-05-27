import Database from 'better-sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  console.log('🔌 Connecting to PostgreSQL database...');
  const { Pool } = pg;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  console.log('💾 Connecting to local SQLite database...');
  // Create a local SQLite database file
  const db = new Database('database.sqlite', { verbose: console.log });

  // Initialize schema since we are using SQLite locally
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resume_history (
      id INTEGER PRIMARY KEY,
      user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
      title TEXT,
      date TEXT,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS summary_history (
      id INTEGER PRIMARY KEY,
      user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
      url TEXT,
      language TEXT,
      text TEXT,
      date TEXT
  );
  `);

  // Mock the PostgreSQL pool object
  pool = {
    query: async (text, params = []) => {
      // Replace PostgreSQL positional parameters $1, $2 with SQLite ?
      const sqliteText = text.replace(/\$\d+/g, '?');
      
      return new Promise((resolve, reject) => {
        try {
          // If query starts with SELECT or contains RETURNING, we expect rows back
          if (sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.trim().toUpperCase().includes('RETURNING')) {
            const rows = db.prepare(sqliteText).all(...params);
            resolve({ rows });
          } else {
            db.prepare(sqliteText).run(...params);
            resolve({ rows: [] });
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  };
}

export default pool;
