import { defineConfig, devices } from "@playwright/test";

// L'ancienne config importait "lovable-agent-playwright-config", un paquet
// interne à la plateforme Lovable absent de package.json : playwright.config.ts
// ne pouvait donc jamais être chargé en dehors de cette plateforme, et aucun
// test e2e/ n'existe dans le dépôt. Remplacé par une config Playwright
// standard, prête à accueillir de vrais tests e2e/ (aucun test n'est fourni
// ici : les écrire nécessite un environnement avec serveur de dev + navigateur).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
  },
});
