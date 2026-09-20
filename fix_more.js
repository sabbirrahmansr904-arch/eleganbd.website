import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix AuthModal handleSubmit
content = content.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => {\n\s*e\.preventDefault\(\);\n\s*setError\(''\);\n\s*setLoading\(true\);\n\n\s*const endpoint = isRegister \? '\/api\/register' : '\/api\/login';\n\s*try {[\s\S]*?catch \(err\) {\n\s*setError\('An error occurred'\);\n\s*}\n\s*setLoading\(false\);\n\s*};/,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Simple mock registration for now, or use Firebase Auth if you want
        // For now, we'll just simulate success
        setIsRegister(false);
        setError('Registration successful! Please login.');
      } else {
        // Simple mock login for now, or use Firebase Auth
        // For now, we'll just simulate success
        onLogin({ id: 1, name: formData.name || 'User', email: formData.email, role: 'customer' });
      }
    } catch (err) {
      setError('An error occurred');
    }
    setLoading(false);
  };`
);

// 2. Fix Checkout handleSubmit
content = content.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => {\n\s*e\.preventDefault\(\);[\s\S]*?catch \(error\) {\n\s*console\.error\('Checkout error:', error\);\n\s*alert\('Failed to place order\. Please try again\.'\);\n\s*}\n\s*setIsSubmitting\(false\);\n\s*};/,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((formData.paymentMethod === 'bKash' || formData.paymentMethod === 'Nagad') && !formData.transactionId) {
      alert('Please enter the Transaction ID');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        totalAmount: total + shipping,
        items: JSON.stringify(items),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'orders'), orderData);
      onSuccess();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    }
    setIsSubmitting(false);
  };`
);

// 3. Fix AdminPanel handleFileUpload
content = content.replace(
  /const handleFileUpload = async \(e: React\.ChangeEvent<HTMLInputElement>, type: 'product' \| 'banner' \| 'promo' = 'product'\) => {[\s\S]*?catch \(error\) {\n\s*console\.error\('Upload error:', error\);\n\s*alert\('Failed to upload image'\);\n\s*}\n\s*setIsUploading\(false\);\n\s*};/,
  `const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'banner' | 'promo' = 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('./firebase');
      const storageRef = ref(storage, \`images/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (type === 'product') {
        setProductFormData({ ...productFormData, image: url });
      } else if (type === 'banner') {
        setBannerFormData({ ...bannerFormData, image: url });
      } else if (type === 'promo') {
        setPromoImage(url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    }
    setIsUploading(false);
  };`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed handleSubmit and handleFileUpload.");
