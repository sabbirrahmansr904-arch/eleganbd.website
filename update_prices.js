import Database from 'better-sqlite3';

const db = new Database('elegan.db');

try {
  // Update all prices
  const updatePrices = db.prepare("UPDATE products SET original_price = ?, price = ?").run(1450, 1099);
  console.log(`Updated prices for all products: ${updatePrices.changes} rows affected`);

  // Verify changes
  const products = db.prepare("SELECT id, name, price, original_price FROM products").all();
  console.log("Current Products:");
  console.table(products);

} catch (error) {
  console.error('Error:', error);
}
