import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import ForoApp from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ForoApp />
  </StrictMode>,
)
