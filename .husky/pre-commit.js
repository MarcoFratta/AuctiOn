<<<<<<< HEAD
import { execSync } from 'child_process'
import fs from 'fs'

// Helper function to run shell commands
const runCommand = (cmd) => {
    try {
        return execSync(cmd, { stdio: 'inherit' })
    } catch (error) {
        console.error(`Error: ${cmd} failed`)
        process.exit(1)
    }
}

// Step 1: Read the last commit message
const commitMessage = fs.readFileSync('.git/COMMIT_EDITMSG', 'utf8').trim()

// Step 2: Extract the scope from the commit message (e.g., feat(auth-service): ...)
const scopeMatch = commitMessage.match(/\(([^)]+)\)/)
if (!scopeMatch) {
    console.log('No scope found in commit message. Running all tests...')
    runCommand('npm run test:all') // Run all tests if no scope is found
    process.exit(0)
}

const scope = scopeMatch[1] // Extract the scope

// Step 3: Map the scope to a package
const packagePaths = [
    'user-service',
    'auth-service',
    'api-gateway',
    'lobby-service',
]

if (!packagePaths.includes(scope)) {
    console.error(`Error: No package found for scope '${scope}'.`)
    process.exit(1)
}

// Step 4: Run tests for the corresponding package
console.log(`Running tests for package: ${scope}`)
runCommand(`npm test --workspace=${scope}`)
=======
import { execSync } from 'child_process';
import fs from 'fs';

// Helper function to run shell commands
const runCommand = (cmd) => {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error: ${cmd} failed`);
    process.exit(1);
  }
};

// Step 1: Read the last commit message
const commitMessage = fs.readFileSync('.git/COMMIT_EDITMSG', 'utf8').trim();

// Step 2: Extract the scope from the commit message (e.g., feat(auth-service): ...)
const scopeMatch = commitMessage.match(/\(([^)]+)\)/);
if (!scopeMatch) {
  console.log('No scope found in commit message. Running all tests...');
  runCommand('npm run test:all'); // Run all tests if no scope is found
  process.exit(0);
}

const scope = scopeMatch[1]; // Extract the scope

// Step 3: Map the scope to a package
const packagePaths = ['user-service', 'auth-service', 'api-gateway', 'lobby-service'];

if (!packagePaths.includes(scope)) {
  console.error(`Error: No package found for scope '${scope}'.`);
  process.exit(1);
}

// Step 4: Run tests for the corresponding package
console.log(`Running tests for package: ${scope}`);
runCommand(`npm test --workspace=${scope}`);
>>>>>>> c774751 (chore: fix project structure bug)
