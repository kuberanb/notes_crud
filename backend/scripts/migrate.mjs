import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  const { rows: [tables] } = await client.query(
    "SELECT to_regclass('users') AS users, to_regclass('notes') AS notes",
  );

  if (tables.users && tables.notes) {
    console.log("Initial schema already exists. No changes made.");
  } else if (tables.users || tables.notes) {
    throw new Error("Only part of the initial schema exists. Inspect the database before migrating.");
  } else {
    const sql = await readFile(
      new URL("../src/migrations/001_initial.sql", import.meta.url),
      "utf8",
    );
    await client.query(sql);
    console.log("Initial migration applied: users and notes tables created.");
  }
} catch (error) {
  await client.query("ROLLBACK");
  console.error(error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
