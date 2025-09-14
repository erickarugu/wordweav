#!/usr/bin/env node

import Database from "better-sqlite3";
import path from "path";

const sqliteDbPath = path.join(process.cwd(), "prisma", "dev.db");

try {
  const db = new Database(sqliteDbPath, { readonly: true });

  console.log("🔍 Inspecting SQLite database...");

  // Get all tables
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();

  console.log("\n📋 Tables found:");
  tables.forEach((table) => {
    console.log(`  - ${table.name}`);

    // Get table schema
    const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(
      `    Columns: ${schema.map((col) => `${col.name} (${col.type})`).join(", ")}`
    );

    // Get row count
    try {
      const count = db
        .prepare(`SELECT COUNT(*) as count FROM ${table.name}`)
        .get();
      console.log(`    Rows: ${count.count}`);
    } catch (error) {
      console.log(`    Rows: Unable to count`);
    }
    console.log();
  });

  db.close();
} catch (error) {
  console.error("Error inspecting database:", error.message);
}
