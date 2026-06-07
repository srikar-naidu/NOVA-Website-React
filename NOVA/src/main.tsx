import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App'

// Import your CSS
import './App.css'

// Import FontAwesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css'

// Import AOS CSS
import 'aos/dist/aos.css'

// Import and initialize AOS
import AOS from 'aos'
AOS.init()

// Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Publishable Key. Ensure VITE_CLERK_PUBLISHABLE_KEY is set.")
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || "missing_key"} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
)
