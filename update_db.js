import Database from 'better-sqlite3';

const db = new Database('elegan.db');

// Clear existing products
db.prepare('DELETE FROM products').run();

const products = [
  { name: "Man's Formal Pant - Cream", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop" },
  { name: "Man's Formal Pant - Black", image: "https://stylisebd.com/wp-content/uploads/2025/12/Formal-Pant-Black-2.webp" },
  { name: "Man's Formal Pant - Light Ash", image: "https://stylisebd.com/wp-content/uploads/2025/12/Formal-Pant-Ash-1-1.webp" },
  { name: "Man's Formal Pant - Dark Navy Blue", image: "https://stylisebd.com/wp-content/uploads/2025/12/Formal-pant-Dark-Navy-1-1.webp" },
  { name: "Man's Formal Pant - Light Blue", image: "https://stylisebd.com/wp-content/uploads/2025/12/Pant-Light-Blue-1.webp" },
  { name: "Man's Formal Pant - Coffee", image: "https://stylisebd.com/wp-content/uploads/2026/01/Pant-Coffe-1.webp" },
  { name: "Man's Formal Pant - Royel Blue", image: "https://stylisebd.com/wp-content/uploads/2025/12/Formal-Pant-Royal-Blue-1-1.webp" }
];

const insertStmt = db.prepare(`
  INSERT INTO products (name, price, original_price, image, images, fabric, fit, description, sizes, rating, reviews, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach(p => {
  insertStmt.run(
    p.name, 
    1199, 
    1550, 
    p.image, 
    JSON.stringify([p.image]), 
    "Woven Cotton", 
    "Slim Fit", 
    "- Premium-quality Woven Cotton Blended with 2% Spandex\n- Tailored straight fit\n- Flat front with sharp crease\n- Comfortable, breathable, and durable\n- Ideal for office, business, and formal wear\n\nA refined essential that blends comfort, versatility, and classic formal style.", 
    JSON.stringify([30, 32, 34, 36, 38]), 
    4.8, 
    42, 
    "Formal Pant"
  );
});

console.log("Products updated successfully.");
