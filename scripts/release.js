/**
 * Release script - bump version, build, and create zip
 *
 * Usage:
 *   node scripts/release.js          # increments patch (default)
 *   node scripts/release.js patch    # increments patch
 *   node scripts/release.js minor    # increments minor
 *   node scripts/release.js major    # increments major
 *   node scripts/release.js 1.0.7    # sets exact version
 */

import { execSync } from 'child_process'
import { rmSync } from 'fs'

const arg = process.argv[2] || 'patch'

try {
  // Bump version
  execSync(`node scripts/bump-version.js ${arg}`, { stdio: 'inherit' })

  // Build (using safe build to avoid embedding sensitive .env data)
  console.log('🔒 Using safe build process (with placeholder values)...')
  execSync('npm run build:safe', { stdio: 'inherit' })

  // Create zip
  execSync('node scripts/create-release-zip.js', { stdio: 'inherit' })

  // Clean up dist folder
  rmSync('dist', { recursive: true, force: true })
  console.log('✓ Cleaned up dist folder')
} catch (error) {
  process.exit(1)
}


