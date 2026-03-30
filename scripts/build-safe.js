#!/usr/bin/env node

/**
 * Safe Build Script
 * 
 * Ensures .env.build exists with placeholder values for production builds.
 * Uses vite build --mode build to load .env.build instead of .env.
 * This avoids embedding sensitive development data in the bundle.
 * 
 * Usage: node scripts/build-safe.js
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const rootDir = process.cwd()
const envBuildPath = join(rootDir, '.env.build')
const configExamplePath = join(rootDir, 'public', 'config.json.example')

console.log('🔒 Starting safe build process...\n')

// Step 1: Ensure .env.build exists
if (!existsSync(envBuildPath)) {
  console.warn('⚠️  Warning: .env.build not found!')
  console.log('   Syncing from config.json.example...\n')
  
  if (existsSync(configExamplePath)) {
    try {
      execSync('node scripts/sync-env-build.js', { stdio: 'inherit' })
      console.log('')
    } catch (error) {
      console.error('❌ Error: Failed to sync .env.build from config.json.example')
      console.error('   Please run: node scripts/sync-env-build.js')
      process.exit(1)
    }
  } else {
    console.error('❌ Error: config.json.example not found!')
    console.error('   Please create .env.build with placeholder values.')
    process.exit(1)
  }
}

// Step 2: Run the build with --mode build to load .env.build
// This ensures .env.build is used instead of .env
console.log('🏗️  Running build with .env.build...\n')
console.log('   (Using vite build --mode build to load .env.build)\n')

try {
  // Use vite build --mode build to load .env.build
  execSync('tsc -b && vite build --mode build', { stdio: 'inherit' })
  console.log('\n✅ Build completed successfully!')
  console.log('   Bundle contains placeholder values from .env.build')
  console.log('   (overridden by config.json at runtime)\n')
} catch (error) {
  console.error('\n❌ Build failed!\n')
  process.exit(1)
}

