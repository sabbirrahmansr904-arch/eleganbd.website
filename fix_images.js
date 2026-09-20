import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "{product.images && product.images.length > 1 && (",
  "{product.images && (typeof product.images === 'string' ? JSON.parse(product.images) : product.images).length > 1 && ("
);

content = content.replace(
  "{product.images.map((img, idx) => (",
  "{(typeof product.images === 'string' ? JSON.parse(product.images) : product.images).map((img: string, idx: number) => ("
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed images map");
