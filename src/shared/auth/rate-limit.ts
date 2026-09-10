import "server-only";
import { getDb } from "@/shared/db/client";
import { hashToken } from "./crypto";

export async function allowAuthAttempt(email: string) {
  const key = hashToken(email);
  // Atomic, shared across processes. Never trust a client-supplied IP header.
  const rows = await getDb().$queryRaw<{ count: number }[]>`
    INSERT INTO "AuthAttempt" ("key", "count", "expiresAt")
    VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "AuthAttempt"."expiresAt" <= NOW() THEN 1 ELSE LEAST("AuthAttempt"."count" + 1, 11) END,
      "expiresAt" = CASE WHEN "AuthAttempt"."expiresAt" <= NOW() THEN NOW() + INTERVAL '15 minutes' ELSE "AuthAttempt"."expiresAt" END
    RETURNING "count"
  `;
  return (rows[0]?.count ?? 11) <= 10;
}
