import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/shared/db/client";
import { hashToken, newSession } from "./crypto";

export const SESSION_COOKIE = "studio_session";

export async function createSession(userId: string) {
  const { token, tokenHash, expiresAt } = newSession();
  const jar = await cookies();
  const previous = jar.get(SESSION_COOKIE)?.value;
  await getDb().$transaction(async (db) => {
    if (previous && /^[a-f0-9]{64}$/.test(previous)) {
      await db.session.deleteMany({
        where: { tokenHash: hashToken(previous) },
      });
    }
    await db.session.deleteMany({
      where: { userId, expiresAt: { lte: new Date() } },
    });
    await db.session.create({ data: { userId, tokenHash, expiresAt } });
  });
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await getDb().session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      user: { select: { id: true, email: true, createdAt: true } },
    },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    await getDb().session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  jar.delete(SESSION_COOKIE);
}
