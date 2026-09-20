import Database from 'better-sqlite3';

const db = new Database('elegan.db');
const products = db.prepare("SELECT id, name FROM products").all();
console.log("Total products:", products.length);
console.table(products);
