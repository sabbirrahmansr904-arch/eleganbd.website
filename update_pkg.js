import fs from 'fs';

let content = fs.readFileSync('package.json', 'utf8');
content = content.replace('"dev": "tsx server.ts"', '"dev": "vite"');
content = content.replace('"start": "node server.ts"', '"start": "vite"');
fs.writeFileSync('package.json', content);
console.log("Updated package.json");
