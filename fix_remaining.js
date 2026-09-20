import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const fetchProducts = \(\) => {[\s\S]*?catch\(err => console\.error\('Product fetch error:', err\)\);\n  };/,
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
  /const fetchBanners = \(\) => {[\s\S]*?catch\(err => console\.error\('Banner fetch error:', err\)\);\n  };/,
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
  /const fetchPromoImage = \(\) => {[\s\S]*?catch\(err => console\.error\('Promo image fetch error:', err\)\);\n  };/,
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

// Fix handleCheckout
content = content.replace(
  /const handleCheckout = async \(e: React\.FormEvent\) => {[\s\S]*?};\n\n  const handleReviewSubmit/m,
  `const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        total: total,
        status: 'pending',
        created_at: new Date().toISOString(),
        items: JSON.stringify(cart)
      };
      await addDoc(collection(db, 'orders'), orderData);
      onComplete();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit`
);

// Fix handleImageUpload
content = content.replace(
  /const handleImageUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?};/m,
  `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('./firebase');
      const storageRef = ref(storage, \`images/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProductFormData(prev => ({ ...prev, image: url, images: JSON.stringify([url]) }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };`
);


fs.writeFileSync('src/App.tsx', content);
console.log("Fixed remaining fetches.");
