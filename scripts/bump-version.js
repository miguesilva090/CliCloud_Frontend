/**
 * Version bump script for React app
 *
 * Usage:
 *   node scripts/bump-version.js          # increments patch (default): 1.0.7 -> 1.0.8
 *   node scripts/bump-version.js patch    # increments patch: 1.0.7 -> 1.0.8
 *   node scripts/bump-version.js minor    # increments minor: 1.0.7 -> 1.1.0
 *   node scripts/bump-version.js major    # increments major: 1.0.7 -> 2.0.0
 *   node scripts/bump-version.js 1.0.7    # sets exact version: x.x.x -> 1.0.7
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const versionJsonPath = path.join(rootDir, 'public', 'version.json')
const packageJsonPath = path.join(rootDir, 'package.json')

const arg = process.argv[2] || 'patch'

// Read current version from version.json
const versionJson = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'))
const currentVersion = versionJson.appVersion

const [major, minor, patch] = currentVersion.split('.').map(Number)

// Check if arg is an exact version (x.x.x format)
const isExactVersion = /^\d+\.\d+\.\d+$/.test(arg)

let newVersion
if (isExactVersion) {
  newVersion = arg
} else {
  switch (arg) {
    case 'major':
      newVersion = `${major + 1}.0.0`
      break
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`
      break
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`
      break
  }
}

// Update version.json
versionJson.appVersion = newVersion
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2) + '\n')

// Update package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
packageJson.version = newVersion
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

console.log(`Version ${isExactVersion ? 'set' : 'incremented'} (${arg}): ${currentVersion} -> ${newVersion}`)

