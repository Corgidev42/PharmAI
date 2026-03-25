import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NeonBackdrop from './components/NeonBackdrop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <NeonBackdrop />
      <div className="relative z-10 min-h-screen">
        <App />
      </div>
    </>
  </StrictMode>,
)
