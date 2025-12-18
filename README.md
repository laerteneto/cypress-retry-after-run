# cypress-retry-after-run
This plugin runs your Cypress tests after a run. Which means it runs first, then it will generate a file with the failed test cases, and then it will run again later only the failed test cases from the first run. 


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

### 4. Run Retry
Run your tests as usual. If they fail, use the retry command to re-run only the failed ones.

```bash
# Via npm script (add "retry": "cypress-retry" to package.json)
npm run retry

# OR directly with npx/yarn
npx cypress-retry
yarn cypress-retry
```

### TypeScript Usage

If you are using TypeScript (`cypress.config.ts`), the setup is similar but using `import` syntax.

#### `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';
// @ts-ignore
import { plugin as grepPlugin } from '@cypress/grep/plugin';
// @ts-ignore
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
