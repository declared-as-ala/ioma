import fs from "fs";
import path from "path";

function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const propName = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(flattenKeys(obj[key], propName));
    } else {
      keys.push(propName);
    }
  }
  return keys;
}

function checkI18nParity() {
  const messagesDir = path.resolve(__dirname, "../../../apps/web/messages");
  const enPath = path.join(messagesDir, "en.json");
  const frPath = path.join(messagesDir, "fr.json");
  const arPath = path.join(messagesDir, "ar.json");

  const enMessages = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const frMessages = JSON.parse(fs.readFileSync(frPath, "utf-8"));
  const arMessages = JSON.parse(fs.readFileSync(arPath, "utf-8"));

  const enKeys = new Set(flattenKeys(enMessages));
  const frKeys = new Set(flattenKeys(frMessages));
  const arKeys = new Set(flattenKeys(arMessages));

  console.log(`[i18n check] Found ${enKeys.size} keys in en.json`);
  console.log(`[i18n check] Found ${frKeys.size} keys in fr.json`);
  console.log(`[i18n check] Found ${arKeys.size} keys in ar.json`);

  let errors = 0;

  // Check missing keys in FR or AR
  for (const key of enKeys) {
    if (!frKeys.has(key)) {
      console.error(`❌ Key missing in fr.json: "${key}"`);
      errors++;
    }
    if (!arKeys.has(key)) {
      console.error(`❌ Key missing in ar.json: "${key}"`);
      errors++;
    }
  }

  // Check extra keys in FR or AR not present in EN
  for (const key of frKeys) {
    if (!enKeys.has(key)) {
      console.error(`❌ Orphan key in fr.json not in en.json: "${key}"`);
      errors++;
    }
  }
  for (const key of arKeys) {
    if (!enKeys.has(key)) {
      console.error(`❌ Orphan key in ar.json not in en.json: "${key}"`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`\n❌ i18n key audit failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    console.log("\n✅ i18n key audit passed! All locales have 100% key parity.");
  }
}

checkI18nParity();
