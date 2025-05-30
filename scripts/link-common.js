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

// Check if running in production mode
const isProduction = process.env.NODE_ENV === 'production'

console.log(`Linking @auction/common package to all services in ${isProduction ? 'production' : 'development'} mode...`)

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

// Check for necessary dist directories
const cjsDirPath = path.join(distPath, 'cjs')
const esmDirPath = path.join(distPath, 'esm')
if (!fs.existsSync(cjsDirPath) || !fs.existsSync(esmDirPath)) {
  console.error('Error: Common package dist structure is incomplete. Please rebuild the common package.')
  process.exit(1)
}

// Create a production-ready package.json reference for copying
function createProductionPackageJson() {
  try {
    const packageJsonPath = path.join(commonPackagePath, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    // Only keep necessary fields for production
    const prodPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      exports: packageJson.exports,
      dependencies: packageJson.dependencies,
    }

    return prodPackageJson
  } catch (error) {
    console.error('Error creating production package.json:', error)
    process.exit(1)
  }
}

// Update the tsconfig.json for a service to include paths to common package
function updateTsConfig(servicePath) {
  try {
    const tsconfigPath = path.join(servicePath, 'tsconfig.json')
    if (!fs.existsSync(tsconfigPath)) {
      console.warn(`Warning: tsconfig.json not found in ${servicePath}, skipping TypeScript configuration.`)
      return
    }

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))

    // Ensure compilerOptions and paths exist
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {}
    }

    // Add paths mapping for @auction/common
    tsconfig.compilerOptions.paths = {
      ...(tsconfig.compilerOptions.paths || {}),
      '@auction/common': ['../common/src/index.ts'],
      '@auction/common/*': ['../common/src/*'],
    }

    // Add reference to common package
    if (!tsconfig.references) {
      tsconfig.references = []
    }

    // Check if reference to common already exists
    const hasCommonRef = tsconfig.references.some(
      ref => ref.path === '../common',
    )

    if (!hasCommonRef) {
      tsconfig.references.push({ path: '../common' })
    }

    // Write the updated tsconfig back to the file
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))

    console.log(`Updated TypeScript configuration for ${path.basename(servicePath)}`)
  } catch (error) {
    console.error(`Error updating tsconfig.json for ${servicePath}:`, error)
  }
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

    if (isProduction) {
      // In production mode, copy files instead of symlinking
      fs.mkdirSync(commonLinkPath, { recursive: true })

      // Copy dist directory
      fs.cpSync(distPath, path.join(commonLinkPath, 'dist'), { recursive: true })

      // Copy source for TypeScript compilation
      const srcPath = path.join(commonPackagePath, 'src')
      if (fs.existsSync(srcPath)) {
        fs.cpSync(srcPath, path.join(commonLinkPath, 'src'), { recursive: true })
      }

      // Copy TypeScript definition files
      const typeFiles = ['tsconfig.json', 'tsconfig.cjs.json', 'tsconfig.esm.json']
      for (const typeFile of typeFiles) {
        const typeFilePath = path.join(commonPackagePath, typeFile)
        if (fs.existsSync(typeFilePath)) {
          fs.copyFileSync(typeFilePath, path.join(commonLinkPath, typeFile))
        }
      }

      // Create a minimal package.json
      const prodPackageJson = createProductionPackageJson()
      fs.writeFileSync(
        path.join(commonLinkPath, 'package.json'),
        JSON.stringify(prodPackageJson, null, 2),
      )

      console.log(`Successfully copied @auction/common to ${service} for production`)
    } else {
      // In development mode, create symlink
      fs.symlinkSync(commonPackagePath, commonLinkPath, 'junction')
      console.log(`Successfully linked @auction/common to ${service} for development`)
    }

    // Update TypeScript configuration
    updateTsConfig(servicePath)
  } catch (error) {
    console.error(`Error linking @auction/common to ${service}:`, error)
  }
}

// Create a composite tsconfig.json in the root directory for TypeScript project references
function createCompositeTypescriptConfig() {
  const rootTsConfigPath = path.join(__dirname, '..', 'tsconfig.json')

  // Create or update the root tsconfig.json
  try {
    let rootTsConfig = {}
    if (fs.existsSync(rootTsConfigPath)) {
      rootTsConfig = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf8'))
    }

    // Set up project references
    if (!rootTsConfig.references) {
      rootTsConfig.references = []
    }

    // Clear existing references and add the common package
    rootTsConfig.references = [{ path: './packages/common' }]

    // Add references to all services
    for (const service of services) {
      const servicePath = path.join(packagesDir, service)
      if (fs.existsSync(servicePath)) {
        rootTsConfig.references.push({ path: `./packages/${service}` })
      }
    }

    // Set other necessary options
    rootTsConfig.compilerOptions = {
      ...(rootTsConfig.compilerOptions || {}),
      composite: true,
      declaration: true,
    }

    // Write the updated config
    fs.writeFileSync(rootTsConfigPath, JSON.stringify(rootTsConfig, null, 2))
    console.log('Updated root TypeScript configuration with project references')
  } catch (error) {
    console.error('Error creating composite TypeScript configuration:', error)
  }
}

// Only create the composite config in development mode
if (!isProduction) {
  createCompositeTypescriptConfig()
}

console.log('Linking complete!')

// Validate that linking worked
let hasErrors = false
for (const service of services) {
  const servicePath = path.join(packagesDir, service)
  if (!fs.existsSync(servicePath)) continue

  const commonLinkPath = path.join(servicePath, 'node_modules', '@auction', 'common')
  const packageJsonPath = path.join(commonLinkPath, 'package.json')

  if (!fs.existsSync(commonLinkPath)) {
    console.error(`Validation failed: @auction/common not found in ${service}`)
    hasErrors = true
    continue
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`Validation failed: package.json not found in @auction/common for ${service}`)
    hasErrors = true
    continue
  }

  console.log(`✓ Validated @auction/common in ${service}`)
}

if (hasErrors) {
  console.error('There were errors during validation. Some services might not work correctly.')
  process.exit(1)
} else {
  console.log('All links validated successfully!')
} 