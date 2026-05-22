import fs from 'fs';
const files = ['lib/algo-searching.ts', 'lib/algo-sorting-1.ts', 'lib/algo-sorting-2.ts'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(file, content);
}
