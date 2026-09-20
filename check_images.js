import Database from 'better-sqlite3';

const db = new Database('elegan.db');
const products = db.prepare("SELECT id, name, image FROM products").all();
console.log(products);
