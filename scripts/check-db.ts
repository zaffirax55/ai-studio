import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { parseEnv } from "../src/shared/config/env";
async function main() {
  const env = parseEnv(process.env);
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });
  try {
    await db.$queryRaw`SELECT 1`;
    await db.user.count();
    console.log("PostgreSQL connection and initial migration: OK");
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    "Database check failed. Check .env, PostgreSQL and npm run db:deploy.",
  );
  process.exitCode = 1;
});
