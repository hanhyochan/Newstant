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


test("logs out from my page", async ({ page }) => {
  await openAuthenticatedHome(page);

  await page.locator(".bottom_nav button").nth(3).click();
  await expect(page.locator(".container_myScreen")).toBeVisible();

  await page.locator(".btn_myLogout").click();
  await expect(page.locator(".container_dialog")).toBeVisible();

  await page.locator(".container_dialog .btn_primary").last().click();
  await expect(page.locator(".container_authLayout")).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() => window.localStorage.getItem("newsroll.currentUser")),
  ).toBeNull();
});
test("withdraws account from my page", async ({ page }) => {
  let didDeleteUser = false;

  await page.route(/\/users\/user-kongkong$/, async (route) => {
    if (route.request().method() === "DELETE") {
      didDeleteUser = true;
      await route.fulfill({
        body: "{}",
        contentType: "application/json",
        status: 200,
      });
      return;
    }

    await route.fallback();
  });

  await openAuthenticatedHome(page);

  await page.locator(".bottom_nav button").nth(3).click();
  await expect(page.locator(".container_myScreen")).toBeVisible();

  await page.locator(".container_myProfile .btn_iconButton").click();
  await expect(page.locator(".container_mySettingsPage")).toBeVisible();

  await page.locator(".container_mySettingsPage .btn_settingRow").first().click();
  await expect(page.locator(".form_mySettingsDetail")).toBeVisible();

  await page.locator(".form_mySettingsDetail .btn_textAction[data-tone='danger']").click();
  await expect(page.locator(".container_dialog")).toBeVisible();

  await page.locator(".container_dialog .btn_primary").last().click();
  expect(didDeleteUser).toBe(true);
  await expect(page.locator(".container_authLayout")).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() => window.localStorage.getItem("newsroll.currentUser")),
  ).toBeNull();
});
