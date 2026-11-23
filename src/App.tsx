// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { Home } from './pages/Home';
import { Books } from './pages/Books';
import { Categories } from './pages/Categories';
import { BookDetail } from './pages/BookDetail';
import { PdfReader } from './pages/PdfReader';
import { NewsList } from './pages/NewsList';
import { NewsDetail } from './pages/NewsDetail';
import { About } from './pages/About';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';

// Auth & User Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Profile } from './pages/user/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBooks } from './pages/admin/AdminBooks';
import { AdminUpload } from './pages/admin/AdminUpload';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSubscriptions } from './pages/admin/AdminSubscriptions';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminDownloads } from './pages/admin/AdminDownloads';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website with Header & Footer */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="books" element={<Books />} />
                <Route path="books/:slug" element={<BookDetail />} />
                <Route path="categories" element={<Categories />} />
                <Route path="news" element={<NewsList />} />
                <Route path="news/:slug" element={<NewsDetail />} />
                <Route path="about" element={<About />} />
                <Route path="terms" element={<Terms />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="profile" element={<Profile />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* In-Browser PDF Reader (Standalone Reader Layout) */}
              <Route path="/read/:bookId" element={<PdfReader />} />

              {/* Admin Portal */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="upload" element={<AdminUpload />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="downloads" element={<AdminDownloads />} />
                <Route path="activity" element={<AdminActivityLogs />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};
