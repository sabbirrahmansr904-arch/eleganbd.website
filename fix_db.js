import Database from 'better-sqlite3';

const db = new Database('elegan.db');

// 1. Remove "Man's Formal Pant - Royal Blue" (the one from server.ts)
const deleteStmt = db.prepare("DELETE FROM products WHERE name = 'Man''s Formal Pant - Royal Blue'");
const deleteResult = deleteStmt.run();
console.log(`Deleted ${deleteResult.changes} Royal Blue pants.`);

// 2. Update description for all products
const newDescription = `- Premium-quality Woven Cotton Blended with 2% Spandex
- Tailored straight fit
- Flat front with sharp crease
- Comfortable, breathable, and durable
- Ideal for office, business, and formal wear

A refined essential that blends comfort, versatility, and classic formal style.`;

const updateDescStmt = db.prepare("UPDATE products SET description = ?");
const result = updateDescStmt.run(newDescription);
console.log(`Updated description for ${result.changes} products.`);

console.log("Database fix completed.");
