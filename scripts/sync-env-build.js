#!/usr/bin/env node

/**
 * Sync config.json.example to .env.build
 * 
 * This script reads config.json.example and generates .env.build
 * with placeholder values that match the config structure.
 * 
 * Usage: node scripts/sync-env-build.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const rootDir = process.cwd()
const configExamplePath = join(rootDir, 'public', 'config.json.example')
const envBuildPath = join(rootDir, '.env.build')

console.log('🔄 Syncing config.json.example to .env.build...\n')

// Check if config.json.example exists
if (!existsSync(configExamplePath)) {
  console.error('❌ Error: public/config.json.example not found!')
  process.exit(1)
}

// Read config.json.example
let config
try {
  const configContent = readFileSync(configExamplePath, 'utf-8')
  config = JSON.parse(configContent)
} catch (error) {
  console.error('❌ Error reading config.json.example:', error.message)
  process.exit(1)
}

// Map config.json keys to VITE_ environment variables
const envVars = []

// Add header comment
envVars.push('# Build Environment Variables (Placeholders Only)')
envVars.push('#')
envVars.push('# ⚠️ IMPORTANT: These values are embedded in the build bundle.')
envVars.push('# However, they are OVERRIDDEN by config.json at runtime.')
envVars.push('#')
envVars.push('# For production builds, use PLACEHOLDER values here since:')
envVars.push('# 1. They will be replaced by config.json at runtime')
envVars.push('# 2. They serve only as a fallback if config.json is missing')
envVars.push('# 3. Using real values here would expose them in the JavaScript bundle')
envVars.push('#')
envVars.push('# This file is auto-generated from config.json.example')
envVars.push('# Run: node scripts/sync-env-build.js')
envVars.push('# Used by: npm run build:safe (via vite build --mode build)')
envVars.push('')

// Map config properties to environment variables
if (config.apiKey) {
  envVars.push(`# API Key (placeholder - will be overridden by config.json)`)
  envVars.push(`VITE_API_KEY=${config.apiKey}`)
  envVars.push('')
}

if (config.urlApiHttp) {
  envVars.push(`# URLs para HTTP (placeholders - will be overridden by config.json)`)
  envVars.push(`VITE_URL_API_HTTP=${config.urlApiHttp}`)
  envVars.push('')
}

if (config.urlApiHttps) {
  envVars.push(`# URLs para HTTPS (placeholders - will be overridden by config.json)`)
  envVars.push(`VITE_URL_API_HTTPS=${config.urlApiHttps}`)
  envVars.push('')
}

if (config.urlAccessControlHttp) {
  envVars.push(`VITE_URL_ACCESS_CONTROL_HTTP=${config.urlAccessControlHttp}`)
  envVars.push('')
}

if (config.urlAccessControlHttps) {
  envVars.push(`VITE_URL_ACCESS_CONTROL_HTTPS=${config.urlAccessControlHttps}`)
  envVars.push('')
}

if (config.updaterApiUrlHttp) {
  envVars.push(`# URLs do Updater (placeholders - will be overridden by config.json)`)
  envVars.push(`VITE_UPDATER_API_URL_HTTP=${config.updaterApiUrlHttp}`)
  envVars.push('')
}

if (config.updaterApiUrlHttps) {
  envVars.push(`VITE_UPDATER_API_URL_HTTPS=${config.updaterApiUrlHttps}`)
  envVars.push('')
}

if (config.updaterApiKey) {
  envVars.push(`# Chave do Updater (placeholder - will be overridden by config.json)`)
  envVars.push(`VITE_UPDATER_API_KEY=${config.updaterApiKey}`)
  envVars.push('')
}

if (config.clientKey) {
  envVars.push(`# Identificador do Cliente (placeholder - will be overridden by config.json)`)
  envVars.push(`VITE_CLIENT_KEY=${config.clientKey}`)
  envVars.push('')
}

if (config.licencaId) {
  envVars.push(`# ID da Licença (placeholder - will be overridden by config.json)`)
  envVars.push(`VITE_LICENCA_ID=${config.licencaId}`)
  envVars.push('')
}

if (config.encryptionKey) {
  envVars.push(`# Encryption Key (placeholder - will be overridden by config.json)`)
  envVars.push(`VITE_ENCRYPTION_KEY=${config.encryptionKey}`)
  envVars.push('')
}

// Write .env.build
try {
  writeFileSync(envBuildPath, envVars.join('\n'), 'utf-8')
  console.log('✅ Created/updated .env.build')
  console.log('   Values synced from config.json.example\n')
} catch (error) {
  console.error('❌ Error writing .env.build:', error.message)
  process.exit(1)
}

