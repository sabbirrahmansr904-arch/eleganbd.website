import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { db, auth } from './firebase';")) {
  content = content.replace(
    "import { Product, CartItem, User, Order, Banner, Coupon, Review } from './types';",
    "import { Product, CartItem, User, Order, Banner, Coupon, Review } from './types';\nimport { db, auth } from './firebase';\nimport { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, setDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';\nimport { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';"
  );
}

content = content.replace(
  /const fetchProducts = \(\) => {[\s\S]*?catch\(err => console\.error\(err\)\);\n  };/,
  `const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };`
);

content = content.replace(
  /const fetchBanners = \(\) => {[\s\S]*?catch\(err => console\.error\(err\)\);\n  };/,
  `const fetchBanners = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'banners'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(data);
    } catch (err) {
      console.error(err);
    }
  };`
);

content = content.replace(
  /const fetchPromoImage = \(\) => {[\s\S]*?catch\(err => console\.error\(err\)\);\n  };/,
  `const fetchPromoImage = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'promo_image_hero'));
      if (docSnap.exists()) {
        setPromoImageHero(docSnap.data().value);
      }
    } catch (err) {
      console.error(err);
    }
  };`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced global fetch functions.");
