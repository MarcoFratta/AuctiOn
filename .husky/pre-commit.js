const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to run shell commands
const runCommand = (cmd) => {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error: ${cmd} failed`);
    process.exit(1);
  }
};

// Step 1: Determine the commit message file
let commitMessageFile = '/tmp/git-commit-msg-.txt';
if (!fs.existsSync(commitMessageFile)) {
  console.log('Temporary commit message file not found. Falling back to .git/COMMIT_EDITMSG.');
  commitMessageFile = path.resolve('.git/COMMIT_EDITMSG');
}

// Step 2: Read the commit message
let commitMessage;
try {
  commitMessage = fs.readFileSync(commitMessageFile, 'utf8').trim();
} catch (error) {
  console.error(`Error reading commit message file: ${error.message}`);
  process.exit(1);
}

// Step 3: Extract the scope from the commit message (e.g., feat(auth-service): ...)
const scopeMatch = commitMessage.match(/\(([^)]+)\)/);
if (!scopeMatch) {
  console.log('No scope found in commit message. Running all tests...');
  runCommand('npm run test:all'); // Run all tests if no scope is found
  process.exit(0);
}

const scope = scopeMatch[1]; // Extract the scope

// Step 4: Map the scope to a package
const packagePaths = ['user-service', 'auth-service', 'api-gateway', 'lobby-service'];

if (!packagePaths.includes(scope)) {
  console.error(`Error: No package found for scope '${scope}'.`);
  process.exit(1);
}

// Step 5: Run tests for the corresponding package
console.log(`Running tests for package: ${scope}`);
runCommand(`npm test --workspace=${scope}`);
