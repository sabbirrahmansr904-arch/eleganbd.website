import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "{(typeof product.images === 'string' ? JSON.parse(product.images) : product.images).map((img: string, idx: number) => (",
  "{(typeof product.images === 'string' ? (product.images ? JSON.parse(product.images) : []) : (product.images || [])).map((img: string, idx: number) => ("
);

content = content.replace(
  "{product.images && (typeof product.images === 'string' ? JSON.parse(product.images) : product.images).length > 1 && (",
  "{product.images && (typeof product.images === 'string' ? (product.images ? JSON.parse(product.images) : []) : (product.images || [])).length > 1 && ("
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed images map parsing");
