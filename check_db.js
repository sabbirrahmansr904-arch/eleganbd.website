import Database from 'better-sqlite3';

const db = new Database('elegan.db');

const allProducts = db.prepare("SELECT id, name FROM products").all();
console.log(allProducts);
