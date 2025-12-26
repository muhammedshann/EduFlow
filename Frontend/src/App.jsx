import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './Features/User/HomePage';
import LoginPage from './Features/Auth/AuthPage';
import OtpPage from './Features/Auth/OtpPage';
import ResetPasswordPage from './Features/Auth/RePasswordPage';
import Notification from './Components/Notification';
import UserDashboard from './Features/User/UserDashboard';
import ProtectedRoute from './Routes/ProtectedRoute';
import Settings from './Features/User/SettingsPage';
import Pomodoro from './Features/Promodoro/Pomodoro';
import NotificationPage from './Features/User/NotificationPage';
import Layout from './Layouts/Layout';
import NotFoundPage from './Components/NotFoundPage';
import EmailPage from './Features/Auth/EmailPage';
import WalletPage from './Features/Wallet/WalletPage';
import AdminLoginPage from './Features/Admin/AdminLoginPage';
import AdminDashboardPage from './Features/Admin/AdminDashboardPage';
import AdminLayout from './Layouts/AdminLayout';
import UserManagement from './Features/Admin/AdminUserPage';
import AdminProtectedRoute from './Routes/AdminProtectedRoute';
import WalletManagement from './Features/Admin/AdminWalletPage';
import HabitTracker from './Features/HabitTracker/HabitTrackerPage';
import GroupsPage from './Features/CommunityGroups/GroupsPage';
import GroupChatPage from './Features/CommunityGroups/GroupChatPage';
import GroupsManagement from './Features/Admin/AdminGroupPage';
import HabitManagement from './Features/Admin/AdminHabitPage';
import PomodoroManagement from './Features/Admin/AdminPomodoro';
import ReviewsPage from './Features/Review/ReviewPage';

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
        <Route path="/enter-email/" element={<EmailPage />} />
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

        {/* 📂 Protected routes WITH sidebar */}
        <Route element={<Layout />}>
          <Route
            path='/wallet/'
            element={
              <ProtectedRoute>
                <WalletPage />
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

          <Route
            path='/habit-tracker/'
            element={
              <ProtectedRoute>
                <HabitTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path='/groups/'
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />


        </Route>

        <Route
          path='/groups/chat/:groupId'
          element={
            <ProtectedRoute>
              <GroupChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/review/'
          element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          }
        />

        {/* admin side */}
        <Route path='/admin/login/' element={
          <AdminLoginPage />
        } />

        <Route element={<AdminLayout />}>
          <Route path='/admin/dashboard/' element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/user/' element={
            <AdminProtectedRoute>
              <UserManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/wallet/' element={
            <AdminProtectedRoute>
              <WalletManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/group/' element={
            <AdminProtectedRoute>
              <GroupsManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/habit/' element={
            <AdminProtectedRoute>
              <HabitManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/pomodoro/' element={
            <AdminProtectedRoute>
              <PomodoroManagement />
            </AdminProtectedRoute>
          } />
        </Route>

        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
