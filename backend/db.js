import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import buildSeed from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "db.json");

let db = null;

export function load() {
  if (db) return db;
  if (fs.existsSync(DATA_FILE)) {
    db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } else {
    db = buildSeed();
    save();
  }
  return db;
}

export function save() {
  if (!db) return;
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function reset() {
  db = buildSeed();
  save();
  return db;
}

export function getDb() {
  return load();
}

export function nextId(collection) {
  const rows = db[collection] || [];
  const ids = rows.map((r) => {
    const n = parseInt(String(r.id).replace(/^\D+/, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  });
  const max = ids.length ? Math.max(...ids) : 0;
  return `${String(collection).slice(0, 2)}${max + 1}`;
}

export function pushActivity(type, message, user, target) {
  db.activities.unshift({
    id: `a${Date.now()}`,
    type,
    message,
    userId: user ? user.id : null,
    userName: user ? user.name : "System",
    target: target || null,
    createdAt: new Date().toISOString()
  });
  if (db.activities.length > 200) db.activities.length = 200;
}
