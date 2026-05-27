import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const sqliteText = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING name, email';
const params = ['Test Name', 'test2@test.com', 'password'];

try {
  const rows = db.prepare(sqliteText).all(...params);
  console.log('Success:', rows);
} catch (err) {
  console.error('Error:', err.message, err.name);
}
