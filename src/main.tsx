import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeContainer } from './di/container'

// DI Container を初期化
// LocalStorage から Gemini API Key を読み込む
const geminiApiKey = localStorage.getItem('gemini_api_key') || ''
initializeContainer(geminiApiKey)

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
