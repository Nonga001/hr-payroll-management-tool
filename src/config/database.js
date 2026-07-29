const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use the DATABASE_PATH environment variable or default
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../hr_payroll.db');

// Ensure the directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Check if database exists, if not, create it from dump
if (!fs.existsSync(DB_PATH)) {
  console.log('🔧 Database not found, creating from schema...');
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(DB_PATH);
  const fs = require('fs');
  const schema = fs.readFileSync(path.join(__dirname, '../../sql/hr_payroll_dump.sql'), 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      console.error('❌ Error creating database:', err);
    } else {
      console.log('✅ Database created successfully');
    }
    db.close();
  });
}

// Create connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisified query helpers
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  query,
  get,
  run
};
