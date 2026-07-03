// ===========================================
// Initializes db/photoclub.db from schema.sql + seed.sql
// Run with: node db/init-db.js
// ===========================================
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'photoclub.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

const freshInstall = !fs.existsSync(DB_PATH);
const db = new Database(DB_PATH);

db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

if (freshInstall) {
  db.exec(fs.readFileSync(SEED_PATH, 'utf8'));
  console.log('✅ Database created and seeded at', DB_PATH);
} else {
  console.log('ℹ️  Database already exists at', DB_PATH, '— schema verified, seed skipped.');
  console.log('   Delete photoclub.db and re-run this script to reseed from scratch.');
}

db.close();
