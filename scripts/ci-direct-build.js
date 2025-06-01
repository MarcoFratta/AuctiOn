const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('Starting direct CI build process...')

const packagesDir = path.join(__dirname, '..', 'packages')
const commonPackagePath = path.join(packagesDir, 'common')

const services = [
  'auction-service',
  'auth-service',
  'lobby-service',
  'user-service',
  'api-gateway',
]

// Build common package first
console.log('Building common package...')
try {
  execSync('npm run build', {
    cwd: commonPackagePath,
    stdio: 'inherit',
  })
  console.log('Common package built successfully')
} catch (error) {
  console.error('Failed to build common package:', error.message)
  process.exit(1)
}

// Ensure common package is linked to each service
for (const service of services) {
  const servicePath = path.join(packagesDir, service)

  if (!fs.existsSync(servicePath)) {
    console.warn(`Service ${service} not found, skipping...`)
    continue
  }

  console.log(`Setting up common package for ${service}...`)

  try {
    // Create node_modules/@auction directory
    const auctionPath = path.join(servicePath, 'node_modules', '@auction')
    fs.mkdirSync(auctionPath, { recursive: true })

    // Remove existing symlink/directory
    const commonDestPath = path.join(auctionPath, 'common')
    if (fs.existsSync(commonDestPath)) {
      fs.rmSync(commonDestPath, { recursive: true, force: true })
    }

    // Create symlink to common package
    fs.symlinkSync(commonPackagePath, commonDestPath, 'dir')

    console.log(`Symlinked common package for ${service}`)
  } catch (error) {
    console.error(`Failed to setup common for ${service}:`, error.message)
    process.exit(1)
  }
}

// Build each service
for (const service of services) {
  const servicePath = path.join(packagesDir, service)

  if (!fs.existsSync(servicePath)) {
    continue
  }

  console.log(`Building ${service}...`)

  try {
    execSync('npm run build', {
      cwd: servicePath,
      stdio: 'inherit',
    })
    console.log(`${service} built successfully`)
  } catch (error) {
    console.error(`Failed to build ${service}:`, error.message)
    process.exit(1)
  }
}

console.log('All services built successfully!') 