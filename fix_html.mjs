import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\r?\n/g, '').replace(/>>>>>>>[^\n]*\n/g, '');
fs.writeFileSync('index.html', content);

