import type { PlaywrightTestConfig } from "@playwright/test"
const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm run example",
    port: 3001,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3001/",
  },
}
export default config
