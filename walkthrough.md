# Walkthrough: Cypress Retry After Run

I have created a `playground` directory to verify the plugin.

## Setup
The playground is located in `playground/`. It has been configured to use the local plugin.

## Verification Steps

### 1. Run Initial Tests (Expect Failures)
Run the following command in the `playground` directory. This will execute the test suite, which contains intentional failures.

```bash
cd playground
yarn install
yarn test
```

Expectation:
- Cypress should fail.
- A `.cypress-failures.json` file should be created in the `playground` directory.

### 2. Run Retry Command
Now, run the retry script. This will use the plugin's CLI to read the failures and re-run only the failed tests.

```bash
yarn retry
```

Expectation:
- Cypress should run again.
- It should ONLY run "Example Failure A" and "Example Failure B".
- "should pass" test should be skipped.

## Plugin Usage
To use this in other projects:
1. Install this package.
2. Add the plugin to [cypress.config.js](file:///C:/Users/laert/.gemini/antigravity/scratch/cypress-retry-after-run/playground/cypress.config.js) ([setupNodeEvents](file:///C:/Users/laert/.gemini/antigravity/scratch/cypress-retry-after-run/playground/cypress.config.js#6-17)).
3. Ensure `@cypress/grep` is installed and initialized.
4. Run `cypress-retry` (or `npx cypress-retry`) to re-run failures.
