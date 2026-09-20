import Database from 'better-sqlite3';

const db = new Database('elegan.db');
const columns = db.prepare("PRAGMA table_info(products)").all();
console.table(columns);
