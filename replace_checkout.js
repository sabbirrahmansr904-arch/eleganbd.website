import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const checkoutReplacement = `const handleCheckout = async (e: React.FormEvent) => {
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
  };`;

content = content.replace(
  /const handleCheckout = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
  checkoutReplacement
);

const reviewReplacement = `const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.user_name || !newReview.comment) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        product_id: product.id.toString(),
        user_name: newReview.user_name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      setReviews([reviewData as any, ...reviews]);
      setNewReview({ user_name: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };`;

content = content.replace(
  /const handleReviewSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
  reviewReplacement
);

const fetchReviewsReplacement = `const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('product_id', '==', product.id.toString()));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data as any);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };`;

content = content.replace(
  /const fetchReviews = async \(\) => {[\s\S]*?};/,
  fetchReviewsReplacement
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced checkout and reviews.");
