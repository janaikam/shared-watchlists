//import { StrictMode } from 'react'
import { HashRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { AuthProvider } from './features/auth/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HashRouter>,
)
