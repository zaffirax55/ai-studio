import { describe, expect, it } from "vitest";
import { parseEnv } from "@/shared/config/env";
describe("server configuration", () => {
  it("defaults to mock without a paid key", () => {
    expect(
      parseEnv({ DATABASE_URL: "postgresql://localhost/studio" }).AI_PROVIDER,
    ).toBe("mock");
  });
  it.each([
    {},
    { DATABASE_URL: "https://example.com" },
    { DATABASE_URL: "postgresql://localhost/studio", AI_PROVIDER: "paid" },
  ])("rejects invalid configuration", (input) => {
    expect(() => parseEnv(input)).toThrow("Проверьте переменные окружения");
  });
  it("never includes credentials in validation errors", () => {
    expect(() => parseEnv({ DATABASE_URL: "invalid-secret-value" })).toThrow(
      /^Проверьте переменные окружения: DATABASE_URL\. См\. \.env\.example\.$/,
    );
  });
});
