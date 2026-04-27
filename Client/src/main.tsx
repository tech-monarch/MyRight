import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './index.css'
import App from './App.tsx'

AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,        // animate only once
  offset: 60,        // trigger 60px before element enters view
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)