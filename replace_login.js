import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const handleLogin = \(e: React\.FormEvent\) => {[\s\S]*?};/,
  `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
    } catch (error) {
      alert('Incorrect email or password');
    }
  };`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced handleLogin.");
