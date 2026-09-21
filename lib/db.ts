import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// SANDBOX-TEST-ONLY data layer. The delivered app talks to the database
// through Prisma (lib/prisma.ts + prisma/schema.prisma) — this file exists
// only because this particular sandbox's network policy blocks Prisma's
// engine-binary download, so it can't run `prisma generate`/`db push` here.
// This file hand-implements the same queries directly against SQLite so the
// real app logic (pages, API routes) can be exercised end-to-end in this
// environment. Swap `lib/prisma.ts` back in on any machine with normal
// internet access — nothing else about the app changes.

const DB_PATH = path.join(process.cwd(), "dev.db");
const SCHEMA_PATH = path.join(process.cwd(), "lib", "schema.sql");

const globalForDb = globalThis as unknown as { db?: Database.Database };

function init(): Database.Database {
  const isNew = !fs.existsSync(DB_PATH);
  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  if (isNew) {
    conn.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));
  }
  return conn;
}

export const db = globalForDb.db ?? init();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export function cuid(): string {
  return "c" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const STAGES = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"] as const;
export type Stage = (typeof STAGES)[number];
