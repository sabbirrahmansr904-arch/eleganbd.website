import Database from 'better-sqlite3';

const db = new Database('elegan.db');

async function updateImage(name, url) {
  try {
    console.log(`Fetching image for ${name}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/webp';
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
    
    const stmt = db.prepare("UPDATE products SET image = ?, images = ? WHERE name = ?");
    const result = stmt.run(base64, JSON.stringify([base64]), name);
    console.log(`Updated ${name}: ${result.changes} rows affected`);
  } catch (error) {
    console.error(`Failed to update ${name}:`, error);
  }
}

async function main() {
  await updateImage("Man's Formal Pant - Royel Blue", "https://stylisebd.com/wp-content/uploads/2025/12/Formal-Pant-Royal-Blue-1-1.webp");
  await updateImage("Man's Formal Pant - Coffee", "https://stylisebd.com/wp-content/uploads/2026/01/Pant-Coffe-1.webp");
}

main();
