import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { UserProvider } from './contexts/UserContext.jsx'
import { CategoryProvider } from './contexts/CategoryContext.jsx'
import { ProductProvider } from './contexts/ProductContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <CategoryProvider>
        <ProductProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ProductProvider>
      </CategoryProvider>
    </UserProvider>
  </StrictMode>,
)
