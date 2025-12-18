const fs = require('fs');
const path = require('path');

const FAILURES_FILE = path.join(process.cwd(), '.cypress-failures.json');

/**
 * Cypress plugin to record failed tests.
 * Add this to your setupNodeEvents function in cypress.config.js
 * 
 * @param {Function} on - Cypress event listener
 * @param {Object} config - Cypress config
 */
function cypressRetryAfterRun(on, config) {
  // Clear the failures file at the start of the run (before:run would be ideal but after:spec matches effectively if we manage it securely, 
  // actually for a plugin `on('task')` or `before:run` is better to clear.
  // But purely additive is safer if we want to support parallel runs potentially? 
  // For now, let's just append. Use a separate cleaner script or user must clean it?
  // Use `before:run` to clean.
  
  on('before:run', () => {
    if (fs.existsSync(FAILURES_FILE)) {
      try {
        fs.unlinkSync(FAILURES_FILE);
      } catch (err) {
        console.error('[cypress-retry-after-run] Failed to clean failures file:', err);
      }
    }
  });

  on('after:spec', (spec, results) => {
    if (!results) return;

    // We are only interested if there are failures
    if (results.stats.failures > 0) {
      const failures = [];

      results.tests.forEach((test) => {
        if (test.displayError || test.state === 'failed') {
          // Flatten titles: ['Parent Suite', 'Child Suite', 'Test Name'] -> "Parent Suite Child Suite Test Name"
          // Or keep as array for exact matching. @cypress/grep uses title string usually.
          const title = test.title.join(' '); 
          failures.push({
            title: title,
            fullTitle: test.title, // Keep array just in case
            spec: spec.relative,
          });
        }
      });

      if (failures.length > 0) {
        // Did you know accessing file concurrently might be an issue?
        // simple synchronous append should be okay for low volume, but locking would be better.
        // For MVP, synchronous read-write.
        let allFailures = [];
        if (fs.existsSync(FAILURES_FILE)) {
            try {
                const content = fs.readFileSync(FAILURES_FILE, 'utf8');
                allFailures = JSON.parse(content);
            } catch (e) {
                // ignore
            }
        }
        
        allFailures = allFailures.concat(failures);
        
        fs.writeFileSync(FAILURES_FILE, JSON.stringify(allFailures, null, 2));
      }
    }
  });
}

module.exports = cypressRetryAfterRun;
