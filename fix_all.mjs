import fs from 'fs';
import path from 'path';
function findFiles(dir) {
  let results = [];
  for (let file of fs.readdirSync(dir, {withFileTypes: true})) {
    if (file.name === 'node_modules' || file.name === 'dist') continue;
    let res = path.join(dir, file.name);
    if (file.isDirectory()) results = results.concat(findFiles(res));
    else if (/\.(js|jsx|ts|tsx|css|html|json)$/.test(res)) results.push(res);
  }
  return results;
}
findFiles('.').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<<<<<<< HEAD')) {
    content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\r?\n/g, '').replace(/>>>>>>>[^\n]*\n/g, '');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});

