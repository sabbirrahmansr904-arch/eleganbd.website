import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const updated = content.replace(
  /const UserPanel = \(\{ isOpen, onClose, onLoginSuccess, user, onLogout \}: \{/g,
  `const UserPanel = ({ isOpen, onClose, onLoginSuccess, user, onLogout, onNavigate }: { \n  onNavigate: (page: string) => void,`
);

fs.writeFileSync('src/App.tsx', updated);
console.log('Done');
