import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import MODULES from './modules.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildInitial() {
  const collections = {};
  for (const mod of MODULES) {
    collections[mod.key] = mod.seed.map((row, i) => ({
      id: `${mod.key.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      ...row,
    }));
  }
  collections.meta = {
    createdAt: new Date().toISOString(),
    version: 1,
    lastResetAt: new Date().toISOString(),
  };
  return collections;
}

let db = null;

export function load() {
  if (db) return db;
  if (fs.existsSync(DATA_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
      console.warn('[db] Corrupt data file, rebuilding:', err.message);
      db = null;
    }
  }
  if (!db) {
    db = buildInitial();
    persist();
  }
  // Ensure any module registered since last write is seeded.
  for (const mod of MODULES) {
    if (!Array.isArray(db[mod.key])) {
      db[mod.key] = buildInitial()[mod.key];
    }
  }
  persist();
  return db;
}

export function persist() {
  if (!db) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

export function reset() {
  db = buildInitial();
  persist();
  return db;
}

export function collection(key) {
  const data = load();
  if (!Array.isArray(data[key])) data[key] = [];
  return data[key];
}

export function insert(key, row) {
  const col = collection(key);
  const record = { id: uid(), ...row };
  col.push(record);
  persist();
  return record;
}

export function update(key, id, patch) {
  const col = collection(key);
  const idx = col.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  col[idx] = { ...col[idx], ...patch, id };
  persist();
  return col[idx];
}

export function remove(key, id) {
  const col = collection(key);
  const idx = col.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  col.splice(idx, 1);
  persist();
  return true;
}

export function getById(key, id) {
  return collection(key).find((r) => r.id === id) || null;
}

export { DATA_FILE, uid };
