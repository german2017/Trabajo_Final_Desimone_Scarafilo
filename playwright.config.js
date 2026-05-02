const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const isRemoteFrontend = /^https?:\/\//.test(baseURL) && !baseURL.includes('127.0.0.1') && !baseURL.includes('localhost');

fs.mkdirSync('playwright-report', { recursive: true });

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: [
    ...(!isRemoteFrontend ? [{
      command: 'node tests/support/static-server.js',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true,
      timeout: 15_000
    }] : []),
    {
      command: 'npm start --prefix backend',
      url: 'http://127.0.0.1:4000/api/properties',
      reuseExistingServer: true,
      timeout: 15_000
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
