import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set: skipping database migrations.");
  process.exit(0);
}
execSync("prisma migrate deploy", { stdio: "inherit" });
