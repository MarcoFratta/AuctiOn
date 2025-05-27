const fs = require('fs-extra')
const path = require('path')

const SERVICES = ['auction-service', 'auth-service', 'user-service', 'lobby-service', 'api-gateway']
const ROOT_DIR = path.resolve(__dirname, '../../..')
const OUTPUT_FILE = path.resolve(__dirname, '../docs/report/self-assessment/coverage.md')

async function extractCoverageData(coverageDir) {
  try {
    // Try to read the coverage-final.json file
    const finalPath = path.join(coverageDir, 'coverage-final.json')
    if (await fs.pathExists(finalPath)) {
      const finalCoverage = await fs.readJson(finalPath)

      // Process the coverage-final.json to extract summary data
      const summary = {
        total: {
          lines: { total: 0, covered: 0, pct: 0 },
          statements: { total: 0, covered: 0, pct: 0 },
          functions: { total: 0, covered: 0, pct: 0 },
          branches: { total: 0, covered: 0, pct: 0 },
        },
        folders: {},
        files: {},
      }

      // Calculate totals from each file
      Object.entries(finalCoverage).forEach(([filePath, data]) => {
        // Extract meaningful file path parts
        const parts = filePath.split('/')
        const fileName = parts[parts.length - 1]

        // Get the folder structure (everything except the filename and the base path)
        const folderParts = parts.slice(parts.indexOf('src') !== -1 ? parts.indexOf('src') : parts.length - 2, parts.length - 1)
        const folder = folderParts.join('/')

        // Initialize folder if it doesn't exist
        if (!summary.folders[folder]) {
          summary.folders[folder] = {
            lines: { total: 0, covered: 0, pct: 0 },
            statements: { total: 0, covered: 0, pct: 0 },
            functions: { total: 0, covered: 0, pct: 0 },
            branches: { total: 0, covered: 0, pct: 0 },
            files: {},
          }
        }

        const fileStats = {
          lines: { total: 0, covered: 0, pct: 0 },
          statements: { total: 0, covered: 0, pct: 0 },
          functions: { total: 0, covered: 0, pct: 0 },
          branches: { total: 0, covered: 0, pct: 0 },
        }

        // Calculate statement coverage
        const stmtTotal = Object.keys(data.statementMap || {}).length
        const stmtCovered = stmtTotal - Object.values(data.s || {})
          .filter(count => count === 0).length
        fileStats.statements = {
          total: stmtTotal,
          covered: stmtCovered,
          pct: stmtTotal ? Math.round((stmtCovered / stmtTotal) * 100) : 100,
        }

        // Calculate branch coverage
        let brTotal = 0
        let brCovered = 0

        if (data.b && data.branchMap) {
          Object.values(data.b).forEach(counts => {
            brTotal += counts.length
            brCovered += counts.filter(count => count > 0).length
          })
        }

        fileStats.branches = {
          total: brTotal,
          covered: brCovered,
          pct: brTotal ? Math.round((brCovered / brTotal) * 100) : 100,
        }

        // Calculate function coverage
        const fnTotal = Object.keys(data.fnMap || {}).length
        const fnCovered = fnTotal - Object.values(data.f || {})
          .filter(count => count === 0).length
        fileStats.functions = {
          total: fnTotal,
          covered: fnCovered,
          pct: fnTotal ? Math.round((fnCovered / fnTotal) * 100) : 100,
        }

        // Use statement coverage for line coverage (simplified)
        fileStats.lines = fileStats.statements

        // Add file stats to the folder
        summary.folders[folder].files[fileName] = fileStats

        // Add to folder totals
        summary.folders[folder].statements.total += fileStats.statements.total
        summary.folders[folder].statements.covered += fileStats.statements.covered
        summary.folders[folder].branches.total += fileStats.branches.total
        summary.folders[folder].branches.covered += fileStats.branches.covered
        summary.folders[folder].functions.total += fileStats.functions.total
        summary.folders[folder].functions.covered += fileStats.functions.covered
        summary.folders[folder].lines.total += fileStats.lines.total
        summary.folders[folder].lines.covered += fileStats.lines.covered

        // Add to global totals
        summary.total.statements.total += fileStats.statements.total
        summary.total.statements.covered += fileStats.statements.covered
        summary.total.branches.total += fileStats.branches.total
        summary.total.branches.covered += fileStats.branches.covered
        summary.total.functions.total += fileStats.functions.total
        summary.total.functions.covered += fileStats.functions.covered
        summary.total.lines.total += fileStats.lines.total
        summary.total.lines.covered += fileStats.lines.covered
      })

      // Calculate percentages for folder totals
      Object.keys(summary.folders).forEach(folder => {
        const folderStats = summary.folders[folder]

        folderStats.statements.pct = folderStats.statements.total
          ? Math.round((folderStats.statements.covered / folderStats.statements.total) * 100)
          : 100
        folderStats.branches.pct = folderStats.branches.total
          ? Math.round((folderStats.branches.covered / folderStats.branches.total) * 100)
          : 100
        folderStats.functions.pct = folderStats.functions.total
          ? Math.round((folderStats.functions.covered / folderStats.functions.total) * 100)
          : 100
        folderStats.lines.pct = folderStats.lines.total
          ? Math.round((folderStats.lines.covered / folderStats.lines.total) * 100)
          : 100
      })

      // Calculate percentages for global totals
      summary.total.statements.pct = summary.total.statements.total
        ? Math.round((summary.total.statements.covered / summary.total.statements.total) * 100)
        : 100
      summary.total.branches.pct = summary.total.branches.total
        ? Math.round((summary.total.branches.covered / summary.total.branches.total) * 100)
        : 100
      summary.total.functions.pct = summary.total.functions.total
        ? Math.round((summary.total.functions.covered / summary.total.functions.total) * 100)
        : 100
      summary.total.lines.pct = summary.total.lines.total
        ? Math.round((summary.total.lines.covered / summary.total.lines.total) * 100)
        : 100

      return summary
    }

    return null
  } catch (error) {
    console.error(`Error extracting coverage data: ${error.message}`)
    return null
  }
}

function getCoverageEmoji(percentage) {
  if (percentage >= 80) return '🟢'
  if (percentage >= 60) return '🟡'
  return '🔴'
}

function generateCoverageTable(summary) {
  if (!summary) return 'No coverage data available.'

  let markdown = ''

  // Add total row
  markdown += '### Overall Coverage\n\n'
  markdown += '| Type | Coverage | Covered/Total |\n'
  markdown += '| ---- | -------- | ------------- |\n'

  const total = summary.total
  markdown += `| **Statements** | ${getCoverageEmoji(total.statements.pct)} ${total.statements.pct}% | ${total.statements.covered}/${total.statements.total} |\n`
  markdown += `| **Branches** | ${getCoverageEmoji(total.branches.pct)} ${total.branches.pct}% | ${total.branches.covered}/${total.branches.total} |\n`
  markdown += `| **Functions** | ${getCoverageEmoji(total.functions.pct)} ${total.functions.pct}% | ${total.functions.covered}/${total.functions.total} |\n`
  markdown += `| **Lines** | ${getCoverageEmoji(total.lines.pct)} ${total.lines.pct}% | ${total.lines.covered}/${total.lines.total} |\n\n`

  // Sort folders by coverage percentage (ascending)
  const sortedFolders = Object.entries(summary.folders)
    .sort((a, b) => a[1].statements.pct - b[1].statements.pct)

  // Add folder sections
  markdown += '### Coverage by Directory\n\n'

  for (const [folder, stats] of sortedFolders) {
    markdown += `#### ${folder || 'root'}\n\n`
    markdown += `| Type | Coverage | Covered/Total |\n`
    markdown += `| ---- | -------- | ------------- |\n`
    markdown += `| **Statements** | ${getCoverageEmoji(stats.statements.pct)} ${stats.statements.pct}% | ${stats.statements.covered}/${stats.statements.total} |\n`
    markdown += `| **Branches** | ${getCoverageEmoji(stats.branches.pct)} ${stats.branches.pct}% | ${stats.branches.covered}/${stats.branches.total} |\n`
    markdown += `| **Functions** | ${getCoverageEmoji(stats.functions.pct)} ${stats.functions.pct}% | ${stats.functions.covered}/${stats.functions.total} |\n`
    markdown += `| **Lines** | ${getCoverageEmoji(stats.lines.pct)} ${stats.lines.pct}% | ${stats.lines.covered}/${stats.lines.total} |\n\n`

    // Add files table
    markdown += '| File | Statements | Branches | Functions | Lines |\n'
    markdown += '| ---- | ---------- | -------- | --------- | ----- |\n'

    // Sort files by coverage percentage (ascending)
    const sortedFiles = Object.entries(stats.files)
      .sort((a, b) => a[1].statements.pct - b[1].statements.pct)

    for (const [file, fileStats] of sortedFiles) {
      markdown += `| ${file} | ${getCoverageEmoji(fileStats.statements.pct)} ${fileStats.statements.pct}% (${fileStats.statements.covered}/${fileStats.statements.total}) | ${getCoverageEmoji(fileStats.branches.pct)} ${fileStats.branches.pct}% (${fileStats.branches.covered}/${fileStats.branches.total}) | ${getCoverageEmoji(fileStats.functions.pct)} ${fileStats.functions.pct}% (${fileStats.functions.covered}/${fileStats.functions.total}) | ${getCoverageEmoji(fileStats.lines.pct)} ${fileStats.lines.pct}% (${fileStats.lines.covered}/${fileStats.lines.total}) |\n`
    }

    markdown += '\n'
  }

  return markdown
}

async function generateCoverageSummary() {
  console.log('Generating coverage summary...')

  let markdownContent = '# Test Coverage Reports\n\n'
  markdownContent += 'This page displays the test coverage reports for each microservice in the AuctiOn platform.' +
    'The coverage reports provide insights into the code quality and testing effectiveness.\n' +
    'They are generated from the **jest** coverage reports files.\n\n'

  for (const service of SERVICES) {
    markdownContent += `## ${service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, ' ')}\n\n`

    // Check in both .coverage and coverage directories
    let coveragePath = path.join(ROOT_DIR, 'packages', service, 'coverage')
    let coverageData = null

    if (await fs.pathExists(coveragePath)) {
      console.log(`Processing coverage for ${service} from coverage directory...`)
      coverageData = await extractCoverageData(coveragePath)
    } else {
      // Try alternate directory
      coveragePath = path.join(ROOT_DIR, 'packages', service, '.coverage')
      if (await fs.pathExists(coveragePath)) {
        console.log(`Processing coverage for ${service} from .coverage directory...`)
        coverageData = await extractCoverageData(coveragePath)
      }
    }

    if (coverageData) {
      markdownContent += generateCoverageTable(coverageData)
    } else {
      markdownContent += 'No coverage data available for this service.\n\n'
    }
  }

  await fs.writeFile(OUTPUT_FILE, markdownContent)
  console.log(`Coverage summary written to ${OUTPUT_FILE}`)
}

generateCoverageSummary().catch(err => {
  console.error('Error generating coverage summary:', err)
  process.exit(1)
})