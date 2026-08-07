import crypto from "node:crypto";
import { getDb, pushActivity } from "./db.js";

const tokens = new Map();
const SESSION_TTL = 1000 * 60 * 60 * 12;

export function login(email, password) {
  const user = getDb().users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !user.active) return null;
  const expected = hashPassword(user.id);
  if (password !== "demo-pass" && password !== expected) return null;
  const token = crypto.randomBytes(24).toString("hex");
  tokens.set(token, { userId: user.id, expires: Date.now() + SESSION_TTL });
  pushActivity("auth", `User ${user.name} signed in`, user);
  return { token, user: publicUser(user) };
}

function hashPassword(seed) {
  return crypto.createHash("sha256").update("colourdiam:" + seed).digest("hex").slice(0, 24);
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  const session = tokens.get(token);
  if (!session || session.expires < Date.now()) {
    tokens.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  const user = getDb().users.find((u) => u.id === session.userId);
  if (!user) return res.status(401).json({ error: "User not found" });
  req.user = user;
  req.role = user.role;
  next();
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export function canWrite(role) {
  return role === "admin" || role === "manager" || role === "sales" || role === "inventory";
}

export function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}
