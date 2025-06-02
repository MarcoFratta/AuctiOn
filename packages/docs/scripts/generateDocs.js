#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const services = ['auth', 'user', 'lobby']
execSync(`npm run build --workspace=@auction/common`, { stdio: 'inherit' })
services.forEach(service => {
  console.log(`Generating docs for ${service}-service...`)
  try {

    // Build the service
    execSync(`npm run build -w @auction/${service}-service`, { stdio: 'inherit' })

    // Generate the documentation
    execSync(`npm run doc -w @auction/${service}-service`, { stdio: 'inherit' })

    // Ensure the specs directory exists
    const specsDir = path.join(__dirname, '..', 'docs', 'specs')
    if (!fs.existsSync(specsDir)) {
      fs.mkdirSync(specsDir, { recursive: true })
    }

    // Copy the generated swagger.json to the docs directory
    const sourcePath = path.join(__dirname, '..', '..', `${service}-service`, 'dist', 'docs', 'swagger.json')
    const destPath = path.join(specsDir, `${service}.json`)

    fs.copyFileSync(sourcePath, destPath)
    console.log(`✅ ${service}-service docs generated successfully`)
  } catch (error) {
    console.error(`❌ Error generating docs for ${service}-service:`, error.message)
    process.exit(1)
  }
})

console.log('All documentation generated successfully!')