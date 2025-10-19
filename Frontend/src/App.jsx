import { useState } from 'react'
import './App.css'
import HomePage from './Pages/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './Pages/Auth/AuthPage'
import OtpPage from './Pages/Auth/OtpPage'
import ResetPasswordPage from './Pages/Auth/RePasswordPage'
import Notification from './Components/Notification'
import UserDashboard from './Pages/UserDashboard'
import ProtectedRoute from './Components/ProtectedRoute'

function App() {

  return (
    <>
    <BrowserRouter>
      <Notification />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login/' element={<LoginPage />} />
        <Route path='/otp/' element={<OtpPage />} />
        <Route path='/reset-password/' element={<ResetPasswordPage />} />
        <Route path='/dashboard/' element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
          } />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
