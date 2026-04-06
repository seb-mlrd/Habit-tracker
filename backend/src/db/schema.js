const db = require('./connection');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    notify_enabled INTEGER NOT NULL DEFAULT 0,
    notify_time TEXT NOT NULL DEFAULT '08:00',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily',
    category TEXT NOT NULL DEFAULT 'other',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completed_on TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(habit_id, completed_on)
  );
`);

// Migrations for existing databases
const habitCols = db.pragma('table_info(habits)').map((c) => c.name);
if (!habitCols.includes('category')) {
  db.exec("ALTER TABLE habits ADD COLUMN category TEXT NOT NULL DEFAULT 'other'");
}

const userCols = db.pragma('table_info(users)').map((c) => c.name);
if (!userCols.includes('notify_enabled')) {
  db.exec('ALTER TABLE users ADD COLUMN notify_enabled INTEGER NOT NULL DEFAULT 0');
}
if (!userCols.includes('notify_time')) {
  db.exec("ALTER TABLE users ADD COLUMN notify_time TEXT NOT NULL DEFAULT '08:00'");
}

module.exports = db;
