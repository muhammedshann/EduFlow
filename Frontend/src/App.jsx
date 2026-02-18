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
import LiveTranscriptionPage from './Features/TranscriptionNotes/LiveTranscriptionPage';
import NotesPage from './Features/TranscriptionNotes/Notes';
import NoteDetailPage from './Features/TranscriptionNotes/NoteDetailPage';
import NotesManagement from './Features/Admin/AdminNotesPage';
import ChatBotPage from './Features/ChatBot/ChatBot';
import AdminReviewManagement from './Features/Admin/AdminReviewPage';
import LiveTranscriptionManagement from './Features/Admin/AdminLiveTranscription';
import ChatBotManagement from './Features/Admin/AdminChatBotPage';
import SubscriptionManagement from './Features/Admin/AdminSubscriptionPage';
import SubscriptionPlansPage from './Features/Subscriptions/SubscriptionPlansPage';
import CheckoutPage from './Features/Subscriptions/CheckoutPage';
import UploadTranscriptionManagement from './Features/Admin/AdminUploadTranscription';
import NotificationManagement from './Features/Admin/AdminNotificationPage';
import AdminPublicRoute from './Routes/AdminPublicRoute';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-black dark:text-white transition-colors duration-300">
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

          <Route
            path='/smart-note/'
            element={
              <ProtectedRoute>
                <LiveTranscriptionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/notes/'
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/chat-bot/'
            element={
              <ProtectedRoute>
                <ChatBotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/chat-bot/:noteId'
            element={
              <ProtectedRoute>
                <ChatBotPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/subscription-plans/'
            element={
              <ProtectedRoute>
                <SubscriptionPlansPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/checkout/'
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

        </Route>

        <Route
          path='/notes/:id'
          element={
            <ProtectedRoute>
              <NoteDetailPage />
            </ProtectedRoute>
          }
        />

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
          <AdminPublicRoute>
            <AdminLoginPage />
          </AdminPublicRoute>
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

          <Route path='/admin/notes/' element={
            <AdminProtectedRoute>
              <NotesManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/review/' element={
            <AdminProtectedRoute>
              <AdminReviewManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/live-transcription/' element={
            <AdminProtectedRoute>
              <LiveTranscriptionManagement />
            </AdminProtectedRoute>
          } />
          <Route path='/admin/upload-transcription/' element={
            <AdminProtectedRoute>
              <UploadTranscriptionManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/chat-bot/' element={
            <AdminProtectedRoute>
              <ChatBotManagement />
            </AdminProtectedRoute>
          } />

          <Route path='/admin/subscriptions/' element={
            <AdminProtectedRoute>
              <SubscriptionManagement />
            </AdminProtectedRoute>
          } />
          <Route path='/admin/notification/' element={
            <AdminProtectedRoute>
              <NotificationManagement />
            </AdminProtectedRoute>
          } />
        </Route>

        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
