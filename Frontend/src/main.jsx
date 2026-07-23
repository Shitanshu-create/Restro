import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './features/auth/services/authContext.jsx'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import './index.css'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
