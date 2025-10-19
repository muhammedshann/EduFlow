import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { Store } from './Redux/Store.js'
import { UserProvider } from './Context/UserContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = '813254453019-jl37gr2g6bfsdpe6dbh7gves0n06mgp8.apps.googleusercontent.com'

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
