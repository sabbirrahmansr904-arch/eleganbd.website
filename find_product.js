import Database from 'better-sqlite3';

const db = new Database('elegan.db');
const products = db.prepare("SELECT id, name FROM products WHERE name LIKE '%Black%'").all();
console.log(products);
