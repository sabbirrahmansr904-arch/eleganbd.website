import fs from 'fs';

const filePath = 'server.ts';
let content = fs.readFileSync(filePath, 'utf8');

const oldDesc = "* Premium-quality Woven Cotton Blended with 2% Spandex\\n\\n* Tailored straight fit\\n\\n* Flat front with sharp creases \\n\\n* Comfortable, breathable, and durable\\n\\n* Ideal for office, business, and formal wear";
const newDesc = "- Premium-quality Woven Cotton Blended with 2% Spandex\\n- Tailored straight fit\\n- Flat front with sharp crease\\n- Comfortable, breathable, and durable\\n- Ideal for office, business, and formal wear\\n\\nA refined essential that blends comfort, versatility, and classic formal style.";

content = content.split(oldDesc).join(newDesc);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated server.ts');
