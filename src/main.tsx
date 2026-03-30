import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.tsx'
import '@/index.css'
import { initRuntimeConfig } from '@/lib/config/runtime-config'
import { getEncryptionKeyAsync } from '@/lib/utils/encryption-key'

// Initialize runtime configuration and pre-load encryption key before rendering the app
// This ensures the encryption key from config.json is available before any stores try to decrypt data
Promise.all([
  initRuntimeConfig(),
  getEncryptionKeyAsync(), // Pre-load encryption key to cache it
]).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
