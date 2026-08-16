/**
 * Runs pending migrations from this directory in filename order, tracking
 * completed ones in the `_migrations` collection so nothing runs twice.
 * See DATA_MODEL.md "Seed & Migration Strategy". No migrations exist yet
 * in Sprint 1 — this runner is wired now so Sprint 2+ schema changes have
 * a documented, non-ad-hoc path from day one.
 */
import "reflect-metadata";
import mongoose from "mongoose";
import { readdirSync } from "fs";
import { join } from "path";

interface Migration {
  name: string;
  up: (db: mongoose.mongo.Db) => Promise<void>;
}

async function main() {
  const mongoUri = process.env.MONGO_URI ?? "mongodb://localhost:27017/ioma";
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection available");

  const migrationsCollection = db.collection("_migrations");
  const applied = new Set(
    (await migrationsCollection.find({}).toArray()).map((m) => m.name as string),
  );

  const files = readdirSync(__dirname).filter(
    (f) => f.endsWith(".migration.ts") || f.endsWith(".migration.js"),
  );

  for (const file of files.sort()) {
    if (applied.has(file)) continue;
    const imported: { default: Migration } = await import(join(__dirname, file));
    const migration = imported.default;
    console.log(`Applying migration: ${file}`);
    await migration.up(db);
    await migrationsCollection.insertOne({ name: file, appliedAt: new Date() });
  }

  console.log("Migrations complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration run failed:", err);
  process.exit(1);
});
