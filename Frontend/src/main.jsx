import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { Store } from './Redux/Store.js'
import { UserProvider } from './Context/UserContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = import.meta.env.VITE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}>
    <UserProvider >
      <StrictMode>
        <Provider store={Store} >
          <App />
        </Provider>
      </StrictMode>
    </UserProvider>
  </GoogleOAuthProvider>
)
