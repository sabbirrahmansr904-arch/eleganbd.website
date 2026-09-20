import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "{product.sizes.map(size => (",
  "{(Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? (product.sizes as string).split(',').map(s => Number(s.trim())).filter(Boolean) : [])).map(size => ("
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed sizes map");
