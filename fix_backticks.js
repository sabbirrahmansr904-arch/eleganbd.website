import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "const storageRef = ref(storage, \\`images/\\${Date.now()}_\\${file.name}\\`);",
  "const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);"
);
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed backticks");
