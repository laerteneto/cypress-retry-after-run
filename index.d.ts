/// <reference types="cypress" />

/**
 * Records failed tests to `.cypress-failures.json` so they can be re-run
 * with the `cypress-retry` CLI. Call it inside `setupNodeEvents`.
 */
declare function cypressRetryAfterRun(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): void;

export = cypressRetryAfterRun;
