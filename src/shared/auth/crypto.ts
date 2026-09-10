import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt-v1:${salt}:${(await derive(password, salt)).toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  const valid = stored?.match(/^scrypt-v1:([a-f0-9]{32}):([a-f0-9]{128})$/);
  // Missing accounts perform the same expensive derivation as existing accounts.
  const key = await derive(password, valid?.[1] ?? "0".repeat(32));
  const expected = Buffer.from(valid?.[2] ?? "0".repeat(128), "hex");
  return timingSafeEqual(key, expected) && !!valid;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newSession() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}
