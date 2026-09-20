import Database from 'better-sqlite3';
import sharp from 'sharp';

const db = new Database('elegan.db');

async function updateProductImage() {
  try {
    // Find the product
    const product = db.prepare("SELECT id, name FROM products WHERE name LIKE '%Dark Navy Blue%'").get();
    if (!product) {
      console.log("Product not found!");
      return;
    }
    console.log(`Found product: ${product.name} (ID: ${product.id})`);

    // Fetch and process image
    const url = 'https://stylisebd.com/wp-content/uploads/2025/12/Formal-pant-Dark-Navy-1-1.webp';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
      
    const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
    
    // Update database
    db.prepare("UPDATE products SET image = ?, images = ? WHERE id = ?").run(
      base64Image,
      JSON.stringify([base64Image]),
      product.id
    );
    
    console.log(`Successfully updated product ${product.id} with new image.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateProductImage();
