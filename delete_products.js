import Database from 'better-sqlite3';

const db = new Database('elegan.db');

try {
  const deleteStmt = db.prepare("DELETE FROM products WHERE name = ? OR name = ?");
  const result = deleteStmt.run("Man's Formal Pant - Light Navy", "Man's Formal Pant - Olive Green");
  
  console.log(`Deleted ${result.changes} products.`);

  const remaining = db.prepare("SELECT id, name FROM products").all();
  console.log(`Remaining products: ${remaining.length}`);
  console.table(remaining);
} catch (error) {
  console.error('Error:', error);
}
