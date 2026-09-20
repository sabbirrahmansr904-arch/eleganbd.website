import Database from 'better-sqlite3';
import sharp from 'sharp';

const db = new Database('elegan.db');

async function updateProductImage() {
  try {
    const url = 'https://stylisebd.com/wp-content/uploads/2025/12/Formal-Pant-Black-2.webp';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
      
    const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
    
    const productId = 2;
    
    db.prepare("UPDATE products SET image = ?, images = ? WHERE id = ?").run(
      base64Image,
      JSON.stringify([base64Image]),
      productId
    );
    
    console.log(`Successfully updated product ${productId} with new image.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateProductImage();
