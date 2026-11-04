import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set: skipping database migrations.");
  process.exit(0);
}
// Neon provides an unpooled URL for migrations; other providers give one direct URL.
const env = { ...process.env, DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL };
execSync("prisma migrate deploy", { stdio: "inherit", env });
