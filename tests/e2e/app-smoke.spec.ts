import { expect, type Page, test } from "@playwright/test";

async function installStoredSession(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "newsroll.currentUser",
      JSON.stringify({
        id: "user-kongkong",
        isAuthenticated: true,
        nickname: "콩콩",
      }),
    );
  });
}

async function openAuthenticatedHome(page: Page) {
  await installStoredSession(page);
  await page.goto("/");

  await expect(page.locator(".phone")).toBeVisible();
  await expect(page.locator(".container_newsrollSplash")).toBeHidden();
  await expect(page.locator(".container_homeScreen")).toBeVisible();
}

test("shows login after the initial splash", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".phone")).toBeVisible();
  await expect(page.locator(".container_newsrollSplash")).toBeHidden();
  await expect(page.locator(".container_authLayout")).toBeVisible();
});

test("shows home after stored session bootstrap", async ({ page }) => {
  await openAuthenticatedHome(page);
});

test("opens primary authenticated tabs", async ({ page }) => {
  await openAuthenticatedHome(page);

  const navButtons = page.locator(".bottom_nav button");

  await navButtons.nth(1).click();
  await expect(page.locator(".all_feed")).toBeVisible();

  await navButtons.nth(2).click();
  await expect(page.locator(".policy_screen")).toBeVisible();

  await navButtons.nth(3).click();
  await expect(page.locator(".container_myScreen")).toBeVisible();

  await navButtons.nth(4).click();
  await expect(page.locator(".info_screen")).toBeVisible();
});

test("opens search and notification overlays", async ({ page }) => {
  await openAuthenticatedHome(page);

  const toolbarButtons = page.locator(".toolbar .toolbar_icon");

  await toolbarButtons.nth(0).click();
  await expect(page.locator(".search_page")).toBeVisible();

  await page.locator(".search_close").click();
  await expect(page.locator(".container_homeScreen")).toBeVisible();

  await toolbarButtons.nth(1).click();
  await expect(page.locator(".list_notificationResults")).toBeVisible();
});
