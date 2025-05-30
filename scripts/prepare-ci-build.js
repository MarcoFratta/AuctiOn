const fs = require('fs')
const path = require('path')

// Path to packages directory
const packagesDir = path.join(__dirname, '..', 'packages')

// Services that need the common package
const services = [
  'auction-service',
  'auth-service',
  'lobby-service',
  'user-service',
  'api-gateway',
]

console.log('Preparing TypeScript configurations for CI build...')

// Update a service's tsconfig.json to include proper paths to common package
function updateServiceTsconfig(serviceName) {
  const servicePath = path.join(packagesDir, serviceName)
  const tsconfigPath = path.join(servicePath, 'tsconfig.json')

  if (!fs.existsSync(tsconfigPath)) {
    console.warn(`Warning: tsconfig.json not found in ${serviceName}, skipping.`)
    return
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))

    // Create or update the compilerOptions and paths
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {}
    }

    // Ensure proper path mappings
    tsconfig.compilerOptions.paths = {
      ...(tsconfig.compilerOptions.paths || {}),
      '@auction/common': ['../common/src/index.ts'],
      '@auction/common/*': ['../common/src/*'],
    }

    // Ensure typeRoots includes node_modules/@types
    if (!tsconfig.compilerOptions.typeRoots) {
      tsconfig.compilerOptions.typeRoots = ['./node_modules/@types', '../node_modules/@types']
    }

    // Set up project reference to common
    if (!tsconfig.references) {
      tsconfig.references = []
    }

    // Check if common reference already exists
    const commonRefExists = tsconfig.references.some(ref => ref.path === '../common')
    if (!commonRefExists) {
      tsconfig.references.push({ path: '../common' })
    }

    // Write updated config
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))
    console.log(`Updated TypeScript configuration for ${serviceName}`)
  } catch (error) {
    console.error(`Error updating tsconfig.json for ${serviceName}:`, error)
  }
}

// Create a special d.ts file in each service's node_modules/@types
function createCommonTypeDefinition(serviceName) {
  const servicePath = path.join(packagesDir, serviceName)
  const typesDir = path.join(servicePath, 'node_modules', '@types')
  const auctionCommonDir = path.join(typesDir, 'auction__common')

  // Create directories if they don't exist
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true })
  }

  if (!fs.existsSync(auctionCommonDir)) {
    fs.mkdirSync(auctionCommonDir, { recursive: true })
  }

  // Create index.d.ts with a reference to the common package
  const indexDtsContent = `
// This is a temporary file created for CI builds
// It helps TypeScript find the @auction/common package

declare module '@auction/common' {
  export * from '../../../common/src/index';
}

declare module '@auction/common/logger' {
  export * from '../../../common/src/logger/Logger';
}

declare module '@auction/common/events/auction' {
  export * from '../../../common/src/events/AuctionEvents';
}

declare module '@auction/common/events/lobby' {
  export * from '../../../common/src/events/LobbyEvents';
}

declare module '@auction/common/messages' {
  export * from '../../../common/src/messages/AuctionMessages';
}

declare module '@auction/common/mongo' {
  export * from '../../../common/src/connections/MongoDB';
}

declare module '@auction/common/redis' {
  export * from '../../../common/src/connections/RedisDB';
}

declare module '@auction/common/validation' {
  export * from '../../../common/src/validation/Validator';
}

declare module '@auction/common/zod' {
  export * from '../../../common/src/utils/ZodWrapper';
}

declare module '@auction/common/middlewares' {
  export * from '../../../common/src/middlewares/ValidationMiddleware';
}
`

  // Write the file
  fs.writeFileSync(path.join(auctionCommonDir, 'index.d.ts'), indexDtsContent)
  console.log(`Created type definition for @auction/common in ${serviceName}`)
}

// Process each service
for (const service of services) {
  const servicePath = path.join(packagesDir, service)

  if (!fs.existsSync(servicePath)) {
    console.warn(`Warning: Service ${service} not found, skipping.`)
    continue
  }

  console.log(`Preparing ${service}...`)
  updateServiceTsconfig(service)
  createCommonTypeDefinition(service)
}

console.log('CI build preparation complete!')