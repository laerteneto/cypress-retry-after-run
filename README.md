# cypress-retry-after-run
A Cypress plugin that enables you to **retry only the failed tests** from a previous run.

In standard Cypress retries, tests are retried immediately within the same execution. However, sometimes you want to run the entire suite first, capture failures, and then trigger a **separate execution** that only runs those specific failed tests (maybe to deploy a fresh new data from an environment or do something else before retrying the failed tests).

### How it works
1.  **Records Failures**: The plugin listens to your test run and saves a list of failed tests to a `.cypress-failures.json` file.
2.  **Smart Retry**: The included CLI command reads this file and launches Cypress again, using `@cypress/grep` to filter and run **only** the tests that failed previously.

This is particularly useful in CI/CD pipelines to save time and resources by avoiding re-execution of passing tests.

## Plugin Usage


### 1. Installation
```bash
npm install --save-dev cypress-retry-after-run @cypress/grep
# OR
yarn add -D cypress-retry-after-run @cypress/grep
```

### 2. Configuration (`cypress.config.js`)
You need to register the plugin in your `setupNodeEvents` function.

```javascript
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
```

### 3. Support File (`cypress/support/e2e.js`)
Ensure `@cypress/grep` is initialized in your support file.

```javascript
const cypressGrep = require('@cypress/grep');
cypressGrep.register();
```

### TypeScript Usage

If you are using TypeScript (`cypress.config.ts`), the setup is similar but using `import` syntax.

#### `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';
import { plugin as grepPlugin } from '@cypress/grep/plugin';
import cypressRetry from 'cypress-retry-after-run';

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
```

#### `cypress/support/e2e.ts`

```typescript
import { register } from '@cypress/grep';
register();
```

If you are using TypeScript, it is also recommended to add the following or something similar to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "es5",
      "dom"
    ],
    "types": [
      "cypress",
      "node"
    ],
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "module": "esnext"
  },
  "include": [
    "**/*.ts"
  ]
}
```


### 4. Run Retry
Run your tests as usual. If some tests fail, use the retry command to re-run only the failed ones.

```bash
# Via npm script (add "retry": "cypress-retry" to package.json) if you want
npm run retry

# OR directly with npx/yarn
npx cypress-retry
yarn cypress-retry
```