// src/components/layout/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  FolderTree,
  Users,
  CreditCard,
  Newspaper,
  BarChart3,
  Download,
  ScrollText,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login?redirect=/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const navItems = [
    { name: 'Dashibodi', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Vitabu Vyote', path: '/admin/books', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Pakia Vitabu (Bulk)', path: '/admin/upload', icon: <UploadCloud className="w-4 h-4" /> },
    { name: 'Kategoria', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { name: 'Watumiaji', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { name: 'Usajili na Mipango', path: '/admin/subscriptions', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Habari na Makala', path: '/admin/news', icon: <Newspaper className="w-4 h-4" /> },
    { name: 'Takwimu & Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Kumbukumbu za Kupakua', path: '/admin/downloads', icon: <Download className="w-4 h-4" /> },
    { name: 'Kumbukumbu za Matukio', path: '/admin/activity', icon: <ScrollText className="w-4 h-4" /> },
    { name: 'Mipangilio ya Mfumo', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-charcoal-950 text-charcoal-500">
        Inathibitisha ruhusa za msimamizi...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-charcoal-950 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-charcoal-700 dark:text-charcoal-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-editorial text-lg font-bold">MaktabaYetu Admin</span>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-charcoal-900 border-r border-charcoal-200/80 dark:border-charcoal-800 p-4 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Platform Info */}
          <div className="px-3 py-2 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-terracotta-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <span className="font-editorial text-lg font-bold block text-charcoal-900 dark:text-white leading-tight">
                  MaktabaYetu
                </span>
                <span className="text-[10px] uppercase font-bold text-terracotta-600 tracking-wider">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? 'bg-terracotta-600 text-white font-semibold shadow-sm'
                      : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-warm-100 dark:hover:bg-charcoal-800'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-charcoal-100 dark:border-charcoal-800 space-y-2">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-charcoal-600 dark:text-charcoal-400 hover:text-terracotta-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Rudi Kwenye Tovuti Kuu</span>
          </Link>
          <div className="px-3 text-[11px] text-charcoal-400">
            Msimamizi: {user?.full_name}
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
