import Database from 'better-sqlite3';

const db = new Database('elegan.db');

try {
  // Update names
  const updateOlive = db.prepare("UPDATE products SET name = ? WHERE name LIKE '%Olive Green%'").run("Man's Formal Pant - Coffee");
  console.log(`Updated Olive Green to Coffee: ${updateOlive.changes} rows affected`);

  const updateNavy = db.prepare("UPDATE products SET name = ? WHERE name LIKE '%Light Navy%'").run("Man's Formal Pant - Royel Blue");
  console.log(`Updated Light Navy to Royel Blue: ${updateNavy.changes} rows affected`);

  // Update all prices
  const updatePrices = db.prepare("UPDATE products SET originalPrice = ?, price = ?").run(1450, 1099);
  console.log(`Updated prices for all products: ${updatePrices.changes} rows affected`);

  // Verify changes
  const products = db.prepare("SELECT id, name, price, originalPrice FROM products").all();
  console.log("Current Products:");
  console.table(products);

} catch (error) {
  console.error('Error:', error);
}
