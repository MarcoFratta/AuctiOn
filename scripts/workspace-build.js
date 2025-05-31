const { execSync } = require('child_process')

console.log('Building with npm workspaces...')

function runCommand(command, options = {}) {
  console.log(`\n🏃 Running: ${command}`)
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options,
    })
    console.log(`✅ Success: ${command}`)
  } catch (error) {
    console.error(`❌ Failed: ${command}`)
    console.error(error.message)
    process.exit(1)
  }
}

// Build common package using npm workspaces
console.log('\n📦 Building common package...')
runCommand('npm run build --workspace=@auction/common')

// Verify common package was built
console.log('\n🔍 Verifying common package build...')
runCommand('ls -la packages/common/dist/')

// Build all services using npm workspaces
console.log('\n🏗️ Building all services...')
const services = [
  'auction-service',
  'auth-service',
  'lobby-service',
  'user-service',
  'api-gateway',
]

for (const service of services) {
  console.log(`\n🔨 Building ${service}...`)
  runCommand(`npm run build --workspace=${service}`)
}

// Build frontend
console.log('\n🎨 Building frontend...')
runCommand('npm run build-only --workspace=frontend')

console.log('\n🎉 All builds completed successfully!') 