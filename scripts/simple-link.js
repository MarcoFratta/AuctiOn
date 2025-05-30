const fs = require('fs')
const path = require('path')

// Path to packages directory
const packagesDir = path.join(__dirname, '..', 'packages')
// Path to common package
const commonPackagePath = path.join(packagesDir, 'common')

// Services that need the common package
const services = [
  'auction-service',
  'auth-service',
  'lobby-service',
  'user-service',
  'api-gateway',
]

console.log('Linking @auction/common package to all services...')

// Check if common package exists
if (!fs.existsSync(commonPackagePath)) {
  console.error('Error: Common package not found!')
  process.exit(1)
}

// Check if common package is built
const distPath = path.join(commonPackagePath, 'dist')
if (!fs.existsSync(distPath)) {
  console.error('Error: Common package has not been built yet. Please run "npm run build-common" first.')
  process.exit(1)
}

// Link common package to all services
for (const service of services) {
  const servicePath = path.join(packagesDir, service)

  // Check if service exists
  if (!fs.existsSync(servicePath)) {
    console.warn(`Warning: Service ${service} not found, skipping...`)
    continue
  }

  console.log(`Linking @auction/common to ${service}...`)

  try {
    // Create node_modules directory if it doesn't exist
    const nodeModulesPath = path.join(servicePath, 'node_modules')
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath, { recursive: true })
    }

    // Create @auction directory if it doesn't exist
    const auctionPath = path.join(nodeModulesPath, '@auction')
    if (!fs.existsSync(auctionPath)) {
      fs.mkdirSync(auctionPath, { recursive: true })
    }

    // Remove existing symlink or directory if it exists
    const commonLinkPath = path.join(auctionPath, 'common')
    if (fs.existsSync(commonLinkPath)) {
      fs.rmSync(commonLinkPath, { recursive: true, force: true })
    }

    // Create symlink to common package
    fs.symlinkSync(commonPackagePath, commonLinkPath, 'junction')
    console.log(`Successfully linked @auction/common to ${service}`)
  } catch (error) {
    console.error(`Error linking @auction/common to ${service}:`, error)
  }
}

console.log('Linking complete!')