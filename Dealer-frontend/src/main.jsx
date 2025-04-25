import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('om-dealer-details-app')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
