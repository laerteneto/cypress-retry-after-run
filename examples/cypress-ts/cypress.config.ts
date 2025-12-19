import { defineConfig } from "cypress"
import { plugin as grepPlugin } from '@cypress/grep/plugin'
import cypressRetry from 'cypress-retry-after-run'

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // 1. Load @cypress/grep
            grepPlugin(config);

            // 2. Load cypress-retry-after-run
            cypressRetry(on, config);

            return config;
        },
    },
});
