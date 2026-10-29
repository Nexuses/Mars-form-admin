/**
 * Create an admin account (signup UI is disabled).
 * Usage: node scripts/create-admin.mjs "Full Name" email@example.com "Password123!"
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    // ignore
  }
}

loadEnv();

const [, , name, email, password] = process.argv;
if (!name || !email || !password) {
  console.error(
    'Usage: node scripts/create-admin.mjs "Full Name" email@example.com "Password123!"',
  );
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "mars" });

const Admin = mongoose.models.Admin ||
  mongoose.model(
    "Admin",
    new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true },
        passwordHash: String,
      },
      { timestamps: true },
    ),
    "admins",
  );

const normalized = email.trim().toLowerCase();
const existing = await Admin.findOne({ email: normalized });
if (existing) {
  console.error("Admin already exists:", normalized);
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const admin = await Admin.create({
  name: name.trim(),
  email: normalized,
  passwordHash,
});

console.log("Created admin:", {
  id: admin._id.toString(),
  name: admin.name,
  email: admin.email,
});
await mongoose.disconnect();
