import { reset, load } from './db.js';
import MODULES from './modules.js';

const db = reset();
const counts = {};
for (const mod of MODULES) counts[mod.key] = db[mod.key].length;
load();
console.log('Database reset & reseeded.');
console.log(JSON.stringify(counts, null, 2));
