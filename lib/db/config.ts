import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Use a singleton pattern to avoid creating multiple pools
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { schema });

export type Database = typeof db;

