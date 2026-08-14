#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const FAILURES_FILE = path.join(process.cwd(), '.cypress-failures.json');

async function main() {
    // chalk is ESM-only in its latest version.
    // Dynamic import() is the correct way to consume an ESM package from a CJS file.
    const { default: chalk } = await import('chalk');

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

    // Collect unique specs that had failures
    const uniqueSpecs = [...new Set(failures.map(f => f.spec))].join(',');

    console.log(chalk.blue(`Targeting specs with failures: ${uniqueSpecs}`));
    
    // Log which tests failed
    console.log(chalk.blue(`Failed tests:`));
    failures.forEach(f => {
        console.log(chalk.blue(`  - ${f.title} (${f.spec})`));
    });

    const args = process.argv.slice(2); // Pass through user args

    try {
        // Build a grep pattern from failed test titles so @cypress/grep filters
        // to run only the previously-failed tests, not all tests in those specs.
        // @cypress/grep v6+ uses --expose grep="..." with semicolon as OR separator.
        const grepPattern = failures.map(f => f.title).join(';');

        const cypressArgs = [
            'cypress', 'run',
            '--spec', uniqueSpecs,
            '--expose', `grep=${grepPattern}`,
            ...args,
        ];

        // Detect package manager by walking up directory tree
        let command = 'npx';
        let args_to_pass = cypressArgs;
        let currentDir = process.cwd();
        let found = false;

        // Walk up the directory tree to find lock file
        while (!found && currentDir !== path.dirname(currentDir)) {
            if (fs.existsSync(path.join(currentDir, 'pnpm-lock.yaml'))) {
                command = 'pnpm';
                args_to_pass = ['exec', ...cypressArgs];
                found = true;
            } else if (fs.existsSync(path.join(currentDir, 'yarn.lock'))) {
                command = 'yarn';
                args_to_pass = cypressArgs;
                found = true;
            } else if (fs.existsSync(path.join(currentDir, 'package-lock.json'))) {
                command = 'npx';
                args_to_pass = cypressArgs;
                found = true;
            }
            currentDir = path.dirname(currentDir);
        }

        console.log(chalk.gray(`Running: ${command} ${args_to_pass.join(' ')}`));

        // Use child_process.spawn with stdio: 'inherit' so Cypress output streams
        // directly to the terminal. execa v8+ changed how it handles stdio,
        // making the built-in spawn the more stable choice here.
        await new Promise((resolve, reject) => {
            const child = spawn(command, args_to_pass, { stdio: 'inherit' });
            child.on('close', (code) => {
                if (code !== 0) {
                    const err = new Error(`Process exited with code ${code}`);
                    err.exitCode = code;
                    reject(err);
                } else {
                    resolve();
                }
            });
            child.on('error', reject);
        });
    } catch (e) {
        console.error(chalk.red('Retry run failed (some tests might have failed again).'));
        process.exit(e.exitCode || 1);
    }
}

main();
