const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

console.log('Setting up @auction/common package for CI builds...')

// Check if common package exists
if (!fs.existsSync(commonPackagePath)) {
  console.error('Error: Common package not found!')
  process.exit(1)
}

// Copy common package to each service's node_modules
for (const service of services) {
  const servicePath = path.join(packagesDir, service)

  // Check if service exists
  if (!fs.existsSync(servicePath)) {
    console.warn(`Warning: Service ${service} not found, skipping...`)
    continue
  }

  console.log(`Setting up @auction/common for ${service}...`)

  try {
    // Create node_modules/@auction directory if it doesn't exist
    const auctionPath = path.join(servicePath, 'node_modules', '@auction')
    fs.mkdirSync(auctionPath, { recursive: true })

    // Remove existing common package if it exists
    const commonDestPath = path.join(auctionPath, 'common')
    if (fs.existsSync(commonDestPath)) {
      fs.rmSync(commonDestPath, { recursive: true, force: true })
    }

    // Copy the entire common package
    fs.mkdirSync(commonDestPath, { recursive: true })

    // Copy package.json first
    fs.copyFileSync(
      path.join(commonPackagePath, 'package.json'),
      path.join(commonDestPath, 'package.json'),
    )

    // Copy src directory if it exists
    const srcPath = path.join(commonPackagePath, 'src')
    if (fs.existsSync(srcPath)) {
      copyDir(srcPath, path.join(commonDestPath, 'src'))
    }

    // Copy dist directory if it exists
    const distPath = path.join(commonPackagePath, 'dist')
    if (fs.existsSync(distPath)) {
      copyDir(distPath, path.join(commonDestPath, 'dist'))
    }

    console.log(`Successfully set up @auction/common for ${service}`)
  } catch (error) {
    console.error(`Error setting up @auction/common for ${service}:`, error)
  }
}

console.log('Setup complete!')

// Helper function to copy a directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
} 