const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // 1. Load @cypress/grep (Required)
      // Note: As of @cypress/grep v5+, use .plugin()
      require('@cypress/grep/plugin').plugin(config);

      // 2. Load cypress-retry-after-run
      // This will record failed tests to .cypress-failures.json
      require('cypress-retry-after-run')(on, config);

      return config;
    },
  },
});