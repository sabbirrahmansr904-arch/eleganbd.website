import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const db = new Database('elegan.db');

async function fixLocalImages() {
  const products = db.prepare("SELECT id, image, images FROM products WHERE image LIKE '/uploads/%'").all();
  
  for (const p of products) {
    try {
      const filePath = path.join(process.cwd(), 'public', p.image);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const optimizedBuffer = await sharp(buffer)
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer();
          
        const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
        
        db.prepare("UPDATE products SET image = ?, images = ? WHERE id = ?").run(
          base64Image,
          JSON.stringify([base64Image]),
          p.id
        );
        console.log(`Fixed local image for product ${p.id}`);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } catch (err) {
      console.error(`Error fixing product ${p.id}:`, err);
    }
  }
}

fixLocalImages();
