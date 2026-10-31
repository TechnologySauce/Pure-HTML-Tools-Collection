import fs from 'fs';
const s = fs.readFileSync('scripts/gen-tools.mjs', 'utf8');
const names = [...s.matchAll(/file:\s*"([^"]+\.html)"/g)].map(m => m[1]);
const c = {};
names.forEach(n => { c[n] = (c[n] || 0) + 1; });
const dup = Object.keys(c).filter(k => c[k] > 1);
console.log('total defs:', names.length);
console.log('duplicates:', dup.length ? dup : 'none');
