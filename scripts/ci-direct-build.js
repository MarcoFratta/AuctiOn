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

  // Verify the build actually created the dist files
  const distPath = path.join(commonPackagePath, 'dist')
  if (!fs.existsSync(distPath)) {
    throw new Error('Common package dist directory not found after build!')
  }

  console.log('=== Common package dist structure ===')
  execSync('find dist -type f | head -20', {
    cwd: commonPackagePath,
    stdio: 'inherit',
  })
  
} catch (error) {
  console.error('Failed to build common package:', error.message)
  process.exit(1)
}

// Helper function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory ${src} does not exist`)
  }

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

// Copy common package to each service's node_modules (instead of symlinking)
for (const service of services) {
  const servicePath = path.join(packagesDir, service)

  if (!fs.existsSync(servicePath)) {
    console.warn(`Service ${service} not found, skipping...`)
    continue
  }

  console.log(`Copying common package to ${service}...`)

  try {
    // Create node_modules/@auction directory
    const auctionPath = path.join(servicePath, 'node_modules', '@auction')
    fs.mkdirSync(auctionPath, { recursive: true })

    // Remove existing directory
    const commonDestPath = path.join(auctionPath, 'common')
    if (fs.existsSync(commonDestPath)) {
      fs.rmSync(commonDestPath, { recursive: true, force: true })
    }

    // Create the destination directory
    fs.mkdirSync(commonDestPath, { recursive: true })

    // Copy package.json
    fs.copyFileSync(
      path.join(commonPackagePath, 'package.json'),
      path.join(commonDestPath, 'package.json'),
    )

    // Copy src directory if it exists
    const srcPath = path.join(commonPackagePath, 'src')
    if (fs.existsSync(srcPath)) {
      copyDir(srcPath, path.join(commonDestPath, 'src'))
    }

    // Copy dist directory (this is crucial!)
    const distPath = path.join(commonPackagePath, 'dist')
    if (fs.existsSync(distPath)) {
      copyDir(distPath, path.join(commonDestPath, 'dist'))
      console.log(`✓ Copied dist files for ${service}`)
    } else {
      throw new Error(`Common package dist directory not found: ${distPath}`)
    }

    console.log(`Successfully copied common package to ${service}`)
  } catch (error) {
    console.error(`Failed to copy common to ${service}:`, error.message)
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
    // Verify common package is available before building
    const commonInService = path.join(servicePath, 'node_modules', '@auction', 'common')
    if (!fs.existsSync(commonInService)) {
      throw new Error(`Common package not found in ${service} node_modules`)
    }
    
    execSync('npm run build', {
      cwd: servicePath,
      stdio: 'inherit',
    })
    console.log(`${service} built successfully`)
  } catch (error) {
    console.error(`Failed to build ${service}:`, error.message)
    console.error('Debugging info:')
    try {
      execSync('ls -la node_modules/@auction/', {
        cwd: servicePath,
        stdio: 'inherit',
      })
    } catch (debugError) {
      console.error('Could not list @auction directory')
    }
    process.exit(1)
  }
}

console.log('All services built successfully!') 