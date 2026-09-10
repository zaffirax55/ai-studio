import { expect, test } from "@playwright/test";

test("anonymous cabinet access redirects to an accessible login form", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Вход в студию" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Пароль", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByRole("link", { name: "Зарегистрироваться" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(
    page.getByRole("heading", { name: "Создать аккаунт" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("register.png"),
    fullPage: true,
  });
});

test("malformed cookies do not grant access", async ({ context, page }) => {
  await context.addCookies([
    { name: "studio_session", value: "forged", url: "http://127.0.0.1:3100" },
  ]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("registration, persistent login and logout with PostgreSQL", async ({
  page,
}) => {
  test.skip(
    process.env.AUTH_E2E_DATABASE !== "1",
    "Requires a migrated test PostgreSQL database; creates one account per run.",
  );
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "test passphrase 2026";
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Выйти" }).click();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("incorrect passphrase");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Неверный email или пароль.",
  );
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
});
