import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run mock:api",
      port: 4000,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "set NEXT_DIST_DIR=.next-e2e&& node .\\node_modules\\next\\dist\\bin\\next dev -p 3100",
      port: 3100,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});