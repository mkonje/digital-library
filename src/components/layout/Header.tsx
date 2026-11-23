// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Sun,
  Moon,
  Globe,
  User,
  Shield,
  Heart,
  Bookmark,
  Download,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.books, path: '/books' },
    { name: t.nav.categories, path: '/categories' },
    { name: t.nav.news, path: '/news' },
    { name: t.nav.about, path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-200/70 dark:border-charcoal-800/80 bg-warm-50/90 dark:bg-charcoal-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-terracotta-600 dark:bg-terracotta-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-charcoal-900 dark:text-white">
                Maktaba<span className="text-terracotta-600 dark:text-terracotta-400">Yetu</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-charcoal-400 -mt-1 font-sans">
                Digital Library
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors py-1 relative ${
                    active
                      ? 'text-terracotta-600 dark:text-terracotta-400 font-semibold'
                      : 'text-charcoal-700 dark:text-charcoal-300 hover:text-charcoal-950 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-terracotta-600 dark:bg-terracotta-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, Language, Theme, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
              title={t.nav.search}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-charcoal-200 dark:border-charcoal-800 hover:border-terracotta-500/50 transition-colors bg-white dark:bg-charcoal-900"
                >
                  <span className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200 max-w-[100px] truncate">
                    {user?.full_name.split(' ')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-terracotta-100 dark:bg-terracotta-900/50 text-terracotta-700 dark:text-terracotta-300 flex items-center justify-center font-bold text-xs">
                    {user?.full_name[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-charcoal-900 shadow-elevated border border-charcoal-200 dark:border-charcoal-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-charcoal-100 dark:border-charcoal-800">
                      <p className="text-xs font-semibold text-charcoal-900 dark:text-white truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-50 dark:hover:bg-terracotta-950/30"
                      >
                        <Shield className="w-4 h-4" />
                        {t.nav.adminDashboard}
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-800"
                    >
                      <User className="w-4 h-4 text-charcoal-400" />
                      {t.nav.myLibrary}
                    </Link>

                    <Link
                      to="/profile?tab=favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-800"
                    >
                      <Heart className="w-4 h-4 text-charcoal-400" />
                      {t.nav.favorites}
                    </Link>

                    <Link
                      to="/profile?tab=reading"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-800"
                    >
                      <Bookmark className="w-4 h-4 text-charcoal-400" />
                      {t.nav.readingHistory}
                    </Link>

                    <Link
                      to="/profile?tab=downloads"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-800"
                    >
                      <Download className="w-4 h-4 text-charcoal-400" />
                      {t.nav.downloads}
                    </Link>

                    <div className="border-t border-charcoal-100 dark:border-charcoal-800 my-1" />

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    {t.nav.register}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Overlay Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-charcoal-200/50 dark:border-charcoal-800 animate-in fade-in duration-200">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                autoFocus
                className="w-full rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-300 dark:border-charcoal-700 py-3 pl-11 pr-20 text-sm text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 shadow-sm"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-terracotta-600 text-white text-xs font-semibold hover:bg-terracotta-700"
              >
                Tafuta
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-200 dark:border-charcoal-800 bg-warm-50 dark:bg-charcoal-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-600 dark:text-terracotta-400 font-semibold'
                    : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-charcoal-200 dark:border-charcoal-800 flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  {t.nav.login}
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  {t.nav.register}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
