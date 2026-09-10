import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  allow: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  verify: vi.fn(),
  hash: vi.fn(),
}));
vi.mock("@/shared/db/client", () => ({
  getDb: () => ({
    user: { create: mocks.create, findUnique: mocks.findUnique },
  }),
}));
vi.mock("@/shared/auth/rate-limit", () => ({ allowAuthAttempt: mocks.allow }));
vi.mock("@/shared/auth/session", () => ({
  createSession: mocks.createSession,
  deleteSession: mocks.deleteSession,
}));
vi.mock("@/shared/auth/crypto", () => ({
  hashPassword: mocks.hash,
  verifyPassword: mocks.verify,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
import { login, register, logout } from "@/app/auth-actions";
function form(password = "long passphrase") {
  const data = new FormData();
  data.set("email", " Person@Example.com ");
  data.set("password", password);
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.allow.mockResolvedValue(true);
  mocks.hash.mockResolvedValue("hashed");
});
it("validates before accessing storage", async () => {
  expect((await register({}, form("short"))).error).toBeTruthy();
  expect(mocks.allow).not.toHaveBeenCalled();
});
it("enforces throttling before password work", async () => {
  mocks.allow.mockResolvedValue(false);
  expect((await login({}, form())).error).toContain("15 минут");
  expect(mocks.findUnique).not.toHaveBeenCalled();
  expect(mocks.createSession).not.toHaveBeenCalled();
});
it("registers with normalized email and hashed password, then creates a session", async () => {
  mocks.create.mockResolvedValue({ id: "new-user" });
  await expect(register({}, form())).rejects.toThrow("redirect:/dashboard");
  expect(mocks.create).toHaveBeenCalledWith({
    data: { email: "person@example.com", passwordHash: "hashed" },
    select: { id: true },
  });
  expect(mocks.createSession).toHaveBeenCalledWith("new-user");
});
it("handles duplicate accounts without creating a session", async () => {
  mocks.create.mockRejectedValue({ code: "P2002" });
  expect((await register({}, form())).error).toContain("попробуйте войти");
  expect(mocks.createSession).not.toHaveBeenCalled();
});
it("returns identical errors for wrong credentials and missing accounts", async () => {
  mocks.findUnique.mockResolvedValue(null);
  const missing = await login({}, form());
  expect(mocks.verify).toHaveBeenCalledWith("long passphrase", null);
  mocks.findUnique.mockResolvedValue({
    id: "existing",
    passwordHash: "stored",
  });
  expect(await login({}, form())).toEqual(missing);
  expect(mocks.createSession).not.toHaveBeenCalled();
});
it("logs in only after verification and does not leak infrastructure errors", async () => {
  mocks.findUnique.mockResolvedValue({
    id: "existing",
    passwordHash: "stored",
  });
  mocks.verify.mockResolvedValue(true);
  await expect(login({}, form())).rejects.toThrow("redirect:/dashboard");
  expect(mocks.createSession).toHaveBeenCalledWith("existing");
  mocks.allow.mockRejectedValue(new Error("secret database URL"));
  expect(JSON.stringify(await login({}, form()))).not.toContain("secret");
});
it("logs out and redirects", async () => {
  await expect(logout()).rejects.toThrow("redirect:/login");
  expect(mocks.deleteSession).toHaveBeenCalled();
});
