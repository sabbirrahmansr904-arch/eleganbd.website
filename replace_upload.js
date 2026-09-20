import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };`;

content = content.replace(
  /const handleImageUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?};/,
  replacement
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced handleImageUpload.");
