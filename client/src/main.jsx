import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { UserProvider } from './contexts/UserContext.jsx'
import { CategoryProvider } from './contexts/CategoryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <CategoryProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </CategoryProvider>
    </UserProvider>
  </StrictMode>,
)
