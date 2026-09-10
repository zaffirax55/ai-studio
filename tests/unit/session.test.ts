import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  jar: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  session: { findUnique: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => mocks.jar }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
vi.mock("@/shared/db/client", () => ({
  getDb: () => ({
    session: mocks.session,
    $transaction: async (
      fn: (db: { session: typeof mocks.session }) => unknown,
    ) => fn({ session: mocks.session }),
  }),
}));
import {
  createSession,
  deleteSession,
  getCurrentUser,
  requireUser,
} from "@/shared/auth/session";
import { hashToken } from "@/shared/auth/crypto";
beforeEach(() => {
  vi.resetAllMocks();
});

it("redirects anonymous users without querying the database", async () => {
  await expect(requireUser()).rejects.toThrow("redirect:/login");
  mocks.jar.get.mockReturnValue({ value: "forged" });
  expect(await getCurrentUser()).toBeNull();
  expect(mocks.session.findUnique).not.toHaveBeenCalled();
});
it("rejects unknown and expired sessions and returns only the selected user", async () => {
  mocks.jar.get.mockReturnValue({ value: "a".repeat(64) });
  mocks.session.findUnique.mockResolvedValue(null);
  expect(await getCurrentUser()).toBeNull();
  mocks.session.findUnique.mockResolvedValue({
    expiresAt: new Date(0),
    user: { id: "1" },
  });
  expect(await getCurrentUser()).toBeNull();
  const user = { id: "1", email: "one@example.com", createdAt: new Date() };
  mocks.session.findUnique.mockResolvedValue({
    expiresAt: new Date(Date.now() + 100000),
    user,
  });
  expect(await requireUser()).toEqual(user);
  expect(mocks.session.findUnique).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { tokenHash: hashToken("a".repeat(64)) },
    }),
  );
});
it("rotates the previous session and stores only the token hash", async () => {
  mocks.jar.get.mockReturnValue({ value: "b".repeat(64) });
  await createSession("user-1");
  const [name, token, options] = mocks.jar.set.mock.calls[0]!;
  expect(name).toBe("studio_session");
  expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  expect(mocks.session.create).toHaveBeenCalledWith({
    data: {
      userId: "user-1",
      tokenHash: hashToken(token),
      expiresAt: options.expires,
    },
  });
  expect(mocks.session.deleteMany).toHaveBeenCalledWith({
    where: { tokenHash: hashToken("b".repeat(64)) },
  });
});
it("revokes the server session before removing the cookie", async () => {
  mocks.jar.get.mockReturnValue({ value: "c".repeat(64) });
  await deleteSession();
  expect(mocks.session.deleteMany).toHaveBeenCalledWith({
    where: { tokenHash: hashToken("c".repeat(64)) },
  });
  expect(mocks.jar.delete).toHaveBeenCalledWith("studio_session");
});
