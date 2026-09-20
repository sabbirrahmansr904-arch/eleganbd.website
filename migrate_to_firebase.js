import Database from 'better-sqlite3';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

// Load config manually since we are in Node.js
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const sqliteDb = new Database('elegan.db');

async function migrate() {
  console.log("Starting migration...");

  // 1. Products
  const products = sqliteDb.prepare("SELECT * FROM products").all();
  for (const p of products) {
    await setDoc(doc(db, 'products', p.id.toString()), {
      name: p.name,
      price: p.price,
      original_price: p.original_price,
      image: p.image,
      images: p.images,
      fabric: p.fabric,
      fit: p.fit,
      description: p.description,
      sizes: p.sizes,
      rating: p.rating,
      reviews: p.reviews,
      category: p.category
    });
    console.log(`Migrated product: ${p.name}`);
  }

  // 2. Banners
  const banners = sqliteDb.prepare("SELECT * FROM banners").all();
  for (const b of banners) {
    await setDoc(doc(db, 'banners', b.id.toString()), {
      image: b.image,
      title: b.title,
      subtitle: b.subtitle,
      button_text: b.button_text,
      link: b.link
    });
    console.log(`Migrated banner: ${b.title}`);
  }

  // 3. Settings
  const settings = sqliteDb.prepare("SELECT * FROM settings").all();
  for (const s of settings) {
    await setDoc(doc(db, 'settings', s.key), {
      value: s.value
    });
    console.log(`Migrated setting: ${s.key}`);
  }

  // 4. Orders
  const orders = sqliteDb.prepare("SELECT * FROM orders").all();
  for (const o of orders) {
    await setDoc(doc(db, 'orders', o.id.toString()), {
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      customer_address: o.customer_address,
      total: o.total,
      status: o.status,
      created_at: o.created_at,
      items: o.items
    });
    console.log(`Migrated order: ${o.id}`);
  }

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch(console.error);
