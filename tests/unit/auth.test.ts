import { describe, expect, it } from "vitest";
import { credentialsSchema } from "@/shared/auth/credentials";
import {
  hashPassword,
  verifyPassword,
  newSession,
  hashToken,
} from "@/shared/auth/crypto";

describe("credentials", () => {
  it("normalizes email without changing the password", () => {
    expect(
      credentialsSchema.parse({
        email: " Person@Example.com ",
        password: " a long password ",
      }),
    ).toEqual({ email: "person@example.com", password: " a long password " });
  });
  it("rejects malformed email and out-of-range passwords", () => {
    for (const [email, password] of [
      ["bad", "long-password"],
      ["a@b.com", "short"],
      ["a@b.com", "x".repeat(129)],
    ]) {
      expect(credentialsSchema.safeParse({ email, password }).success).toBe(
        false,
      );
    }
  });
});

describe("password storage", () => {
  it("uses unique salts and verifies only the exact password", async () => {
    const password = " a strong passphrase ";
    const first = await hashPassword(password);
    expect(first).not.toContain(password);
    expect(first).not.toBe(await hashPassword(password));
    expect(await verifyPassword(password, first)).toBe(true);
    expect(await verifyPassword(password.trim(), first)).toBe(false);
    expect(await verifyPassword(password, null)).toBe(false);
    expect(await verifyPassword(password, "malformed")).toBe(false);
  });
});

it("creates unpredictable tokens with a seven-day expiry and separate storage hashes", () => {
  const session = newSession();
  expect(session.token).toMatch(/^[a-f0-9]{64}$/);
  expect(session.token).not.toBe(newSession().token);
  expect(session.tokenHash).toBe(hashToken(session.token));
  expect(session.tokenHash).not.toBe(session.token);
  expect(session.expiresAt.getTime() - Date.now()).toBeGreaterThan(
    7 * 86400000 - 1000,
  );
});
