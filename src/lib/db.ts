import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!cached) {
    const client = postgres(process.env.DATABASE_URL, { max: 5, prepare: false });
    cached = drizzle(client, { schema });
  }
  return cached;
}
