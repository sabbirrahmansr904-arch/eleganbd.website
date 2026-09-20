import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const newUseEffect = `  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      if (activeTab === 'orders') {
        getDocs(collection(db, 'orders')).then(snapshot => {
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'products') {
        getDocs(collection(db, 'products')).then(snapshot => {
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'banners') {
        getDocs(collection(db, 'banners')).then(snapshot => {
          setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'customers') {
        getDocs(collection(db, 'customers')).then(snapshot => {
          setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'coupons') {
        getDocs(collection(db, 'coupons')).then(snapshot => {
          setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'customization') {
        getDoc(doc(db, 'settings', 'promo_image_hero')).then(docSnap => {
          if (docSnap.exists()) {
            setPromoImage(docSnap.data().value);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, activeTab]);`;

content = content.replace(
  /useEffect\(\(\) => {\n\s*if \(isAuthenticated\) {\n\s*setLoading\(true\);\n\s*if \(activeTab === 'orders'\) {[\s\S]*?}, \[isAuthenticated, activeTab\]\);/,
  newUseEffect
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced AdminPanel useEffect.");
