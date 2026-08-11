import { defineConfig } from "@playwright/test";

const deployedBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: deployedBaseUrl || "http://127.0.0.1:4173/portfolio/",
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: deployedBaseUrl ? undefined : {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/portfolio/",
    reuseExistingServer: true
  }
});
