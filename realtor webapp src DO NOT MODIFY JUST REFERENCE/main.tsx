import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { checkSupabaseConnection } from './services/supabaseClient'
import { authManager } from './services/authManager'

// Check Supabase connection on app launch
checkSupabaseConnection()

// Initialize auth manager (handles user persistence and token refresh)
authManager.initialize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
