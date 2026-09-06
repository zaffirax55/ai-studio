import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { parseEnv } from "@/shared/config/env";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export function getDb() {
  if (!globalDb.prisma) {
    const env = parseEnv(process.env);
    globalDb.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    });
  }
  return globalDb.prisma;
}
