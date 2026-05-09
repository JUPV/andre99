import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../fundamentus.db');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

export default db;
