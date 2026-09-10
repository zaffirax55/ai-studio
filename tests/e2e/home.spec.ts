import { expect, test } from "@playwright/test";
test("home page is accessible and fits the viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Предмет — AI-студия товаров");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ваш товар. В лучшем свете.",
  );
  await expect(page.getByRole("status")).toContainText(
    "Регистрация и личный кабинет уже доступны",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "предмет", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("home.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
