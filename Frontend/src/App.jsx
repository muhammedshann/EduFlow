import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/Auth/AuthPage';
import OtpPage from './Pages/Auth/OtpPage';
import ResetPasswordPage from './Pages/Auth/RePasswordPage';
import Notification from './Components/Notification';
import UserDashboard from './Pages/UserDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import Settings from './Pages/SettingsPage';
import Pomodoro from './Pages/Productivity/Promodoro';
import NotificationPage from './Pages/NotificationPage';
import Layout from './Layouts/Layout';
import NotFoundPage from './Components/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Notification />
      <Routes>
        {/* 🏠 Public routes (no sidebar) */}
        <Route path='/' element={<HomePage />} />
        <Route path='/auth/' element={
          <ProtectedRoute isLogin={true} >
            <LoginPage />
          </ProtectedRoute>
        } />
        <Route path='/otp/' element={<OtpPage />} />
        <Route path='/reset-password/' element={<ResetPasswordPage />} />

        {/* 👤 Protected routes WITHOUT sidebar */}
        <Route
          path='/dashboard/'
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/settings/'
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 📂 Protected routes WITH sidebar */}
        <Route element={<Layout />}>
          <Route
            path='/promodoro/'
            element={
              <ProtectedRoute>
                <Pomodoro />
              </ProtectedRoute>
            }
          />
          <Route
            path='/notification/'
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
