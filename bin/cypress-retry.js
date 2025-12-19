#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const chalk = require('chalk');

const FAILURES_FILE = path.join(process.cwd(), '.cypress-failures.json');

async function main() {
    if (!fs.existsSync(FAILURES_FILE)) {
        console.log(chalk.green('No failures file found. Everything seems to have passed previously!'));
        process.exit(0);
    }

    let failures;
    try {
        failures = JSON.parse(fs.readFileSync(FAILURES_FILE, 'utf8'));
    } catch (e) {
        console.error(chalk.red('Failed to parse failures file.'));
        process.exit(1);
    }

    if (!failures || failures.length === 0) {
        console.log(chalk.green('No failures recorded.'));
        process.exit(0);
    }

    console.log(chalk.yellow(`Found ${failures.length} failed tests. Retrying...`));

    // Construct grep string
    // @cypress/grep supports OR via "; " (semicolon + space)
    // We need to escape special characters in titles if necessary, but @cypress/grep is loosely regex or string match.
    // To match exact titles, it's safer to use the 'tags' or just the raw titles.
    // We'll join titles with "; " which acts as OR.
    // Warning: If titles contain ";", this might break. 
    // Ideally, we should escape ";".
    const grepString = failures.map(f => f.title.replace(/;/g, '\\;')).join('; ');

    // Also collect unique specs if we want to limit to specific files (optimization)
    // But @cypress/grep might search all specs unless we also filter specs.
    // `cypress run --spec ...` accepts glob patterns.
    const uniqueSpecs = [...new Set(failures.map(f => f.spec))].join(',');

    console.log(chalk.blue(`Targeting specs: ${uniqueSpecs}`));
    // console.log(chalk.blue(`Grep pattern: ${grepString}`)); // checking grep string length might be useful

    const args = process.argv.slice(2); // Pass through user args

    // Construct the environment variable for grep
    // Cypress requires CYPRESS_ prefix for env vars to be read into config.env
    const env = {
        ...process.env,
        CYPRESS_grep: grepString,
        // CYPRESS_grepBurn: 1 
    };

    try {
        // Run Cypress
        // We use 'cypress run' but we need to make sure we look for the local binary
        // usually `npx cypress run` or just `cypress run` if in path.
        // If we are a bin script in the same project, we might want to spawn the sibling cypress.
        // Safest is `npx cypress run` or assuming `cypress` is in path or `node_modules/.bin/cypress`

        // We'll append the --spec argument to limit the files scanned
        const cypressArgs = ['cypress', 'run', '--spec', uniqueSpecs, ...args];

        // Check if we are in a yarn project (presence of yarn.lock)
        // Or just prefer npx/yarn based on user preference? User asked for yarn.
        // If we use 'yarn', it automatically looks for local binaries.

        const command = 'yarn';
        // If yarn is not in path, this might fail unless we use absolute path.
        // But since `npm` wasn't in path, `yarn` likely isn't either.
        // However, users who use yarn generally have it configured.
        // Since I know where yarn.cmd is likely to be (AppData/Roaming/npm), I could try to detect it or fallback.
        // For now, let's try 'yarn' assuming the user will fix their environment or I'll provide instructions.
        // Actually, sticking to 'npx' is safer if they have node but not yarn in path? 
        // No, user EXPLICITLY asked for yarn.

        console.log(chalk.gray(`Running: ${command} ${cypressArgs.join(' ')}`));

        await execa(command, cypressArgs, {
            env,
            stdio: 'inherit',

        });
    } catch (e) {
        console.error(chalk.red('Retry run failed (some tests might have failed again).'));
        process.exit(e.exitCode || 1);
    }
}

main();
