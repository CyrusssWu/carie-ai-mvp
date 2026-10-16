import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { TestNotice } from './components/TestNotice'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary><AppProvider><TestNotice/><App/></AppProvider></AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)
