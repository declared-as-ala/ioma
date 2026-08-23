import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

async function backup() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ioma";
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to get MongoDB database instance");
  }

  const collections = [
    "products",
    "productvariants",
    "productranges",
    "categories",
    "skinconcerns",
    "diagnosisrecommendations",
  ];
  const exportData: Record<string, any[]> = {};

  for (const collName of collections) {
    try {
      const coll = db.collection(collName);
      const docs = await coll.find({}).toArray();
      exportData[collName] = docs;
      console.log(`Exported ${docs.length} documents from "${collName}".`);
    } catch (err) {
      console.warn(
        `Collection "${collName}" not found or empty: ${(err as Error).message}`,
      );
      exportData[collName] = [];
    }
  }

  const repoRoot = path.resolve(__dirname, "../../../");
  const backupDir = path.join(repoRoot, "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filename = `catalog-before-official-import-2026-08-22.json`;
  const filePath = path.join(backupDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf8");

  console.log(`\nSuccessfully saved catalog backup to ${filePath}`);
  await mongoose.disconnect();
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
