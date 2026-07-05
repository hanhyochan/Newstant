import { expect, test } from "@playwright/test";

test("shows login after the initial splash", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".phone")).toBeVisible();
  await expect(page.locator(".container_newsrollSplash")).toBeHidden();
  await expect(page.locator(".container_authLayout")).toBeVisible();
});

test("shows home after stored session bootstrap", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "newsroll.currentUser",
      JSON.stringify({
        id: "user-kongkong",
        isAuthenticated: true,
        nickname: "콩콩이",
      }),
    );
  });

  await page.goto("/");

  await expect(page.locator(".phone")).toBeVisible();
  await expect(page.locator(".container_newsrollSplash")).toBeHidden();
  await expect(page.locator(".container_homeScreen")).toBeVisible();
});