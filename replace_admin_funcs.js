import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  {
    regex: /const updateStatus = async \(orderId: number, status: string\) => {[\s\S]*?};/,
    replacement: `const updateStatus = async (orderId: number | string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId.toString()), { status });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };`
  },
  {
    regex: /const handleProductSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
    replacement: `const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id.toString()), productFormData);
      } else {
        await addDoc(collection(db, 'products'), productFormData);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ name: '', price: 0, original_price: 0, image: '', images: '', fabric: '', fit: '', description: '', sizes: '', rating: 5.0, reviews: 0, category: 'Formal Pant' });
      getDocs(collection(db, 'products')).then(snapshot => setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      onRefreshProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };`
  },
  {
    regex: /const deleteProduct = async \(id: number\) => {[\s\S]*?};/,
    replacement: `const deleteProduct = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id.toString()));
      setProducts(prev => prev.filter(p => p.id !== id));
      onRefreshProducts();
    } catch (err) {
      console.error(err);
    }
  };`
  },
  {
    regex: /const handleBannerSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
    replacement: `const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'banners'), bannerFormData);
      setShowBannerForm(false);
      setBannerFormData({ image: '', title: '', subtitle: '', button_text: 'Shop Now', link: '' });
      getDocs(collection(db, 'banners')).then(snapshot => setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      onRefreshBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };`
  },
  {
    regex: /const deleteBanner = async \(id: number\) => {[\s\S]*?};/,
    replacement: `const deleteBanner = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id.toString()));
      setBanners(prev => prev.filter(b => b.id !== id));
      onRefreshBanners();
    } catch (err) {
      console.error(err);
    }
  };`
  },
  {
    regex: /const handleCouponSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
    replacement: `const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), couponFormData);
      setShowCouponForm(false);
      setCouponFormData({ code: '', discount_percentage: 0, is_active: 1, expiry_date: '' });
      getDocs(collection(db, 'coupons')).then(snapshot => setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };`
  },
  {
    regex: /const deleteCoupon = async \(id: number\) => {[\s\S]*?};/,
    replacement: `const deleteCoupon = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id.toString()));
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };`
  },
  {
    regex: /const handlePromoImageSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
    replacement: `const handlePromoImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'promo_image_hero'), { value: promoImage });
      alert('Promo image updated successfully');
      onRefreshPromoImage();
    } catch (error) {
      console.error('Error saving promo image:', error);
    }
  };`
  },
  {
    regex: /const handleDeletePromoImage = async \(\) => {[\s\S]*?};/,
    replacement: `const handleDeletePromoImage = async () => {
    if (confirm('Are you sure you want to delete the promo image?')) {
      try {
        await setDoc(doc(db, 'settings', 'promo_image_hero'), { value: '' });
        setPromoImage('');
        onRefreshPromoImage();
      } catch (error) {
        console.error('Error deleting promo image:', error);
      }
    }
  };`
  }
];

replacements.forEach(({ regex, replacement }) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced admin functions.");
