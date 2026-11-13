import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import {
  MapPin,
  Bell,
  Sun,
  Moon,
  PlusCircle,
  Menu,
  X,
  User,
  LogOut,
  ShieldAlert,
  Briefcase,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, role, getDashboardPath } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'text-brand-700 bg-brand-50/80 dark:bg-brand-950/40 dark:text-brand-300 font-semibold'
        : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-white hover:bg-sand-100 dark:hover:bg-charcoal-800'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand-200/80 dark:border-charcoal-800 bg-sand-50/90 dark:bg-charcoal-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-charcoal-900 dark:text-sand-50 block leading-none">
              CivicFix
            </span>
            <span className="text-[10px] tracking-widest text-charcoal-400 dark:text-charcoal-400 uppercase font-sans font-medium">
              Public Works Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/explore" className={navLinkClass}>
            Explore Map
          </NavLink>

          {isAuthenticated && (
            <>
              {role === 'citizen' && (
                <NavLink to="/citizen" className={navLinkClass}>
                  My Reports
                </NavLink>
              )}

              {role === 'staff' && (
                <NavLink to="/staff" className={navLinkClass}>
                  Staff Portal
                </NavLink>
              )}

              {role === 'admin' && (
                <>
                  <NavLink to="/admin" end className={navLinkClass}>
                    Analytics
                  </NavLink>
                  <NavLink to="/admin/issues" className={navLinkClass}>
                    Manage Issues
                  </NavLink>
                  <NavLink to="/admin/users" className={navLinkClass}>
                    Manage Users
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-xl text-charcoal-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Report Issue CTA button (Citizen only or anytime authenticated) */}
              <Link
                to="/report"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </Link>

              {/* Notifications Bell */}
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-charcoal-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-charcoal-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-sand-50 dark:ring-charcoal-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sand-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-sand-300 dark:ring-charcoal-600"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block text-xs font-medium text-charcoal-800 dark:text-sand-200">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-sand-100 dark:border-charcoal-700">
                      <p className="text-xs font-semibold text-charcoal-900 dark:text-sand-50 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sand-100 dark:bg-charcoal-700 text-charcoal-600 dark:text-sand-300">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-sand-200 hover:bg-sand-50 dark:hover:bg-charcoal-700/60"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>Role Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-sand-200 hover:bg-sand-50 dark:hover:bg-charcoal-700/60"
                    >
                      <User className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <div className="border-t border-sand-100 dark:border-charcoal-700 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-charcoal-700 dark:text-sand-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login?tab=register"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="md:hidden p-2 rounded-xl text-charcoal-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-charcoal-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 dark:border-charcoal-800 bg-sand-50 dark:bg-charcoal-900 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-charcoal-700 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-charcoal-800"
          >
            Explore Map
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-charcoal-700 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-charcoal-800"
              >
                My Dashboard ({user?.role})
              </Link>

              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-terracotta-600 dark:text-terracotta-400 hover:bg-sand-100 dark:hover:bg-charcoal-800"
              >
                + Report an Issue
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-charcoal-700 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-charcoal-800"
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-charcoal-700 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-charcoal-800"
              >
                Profile & Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-xl text-sm font-medium border border-sand-300 dark:border-charcoal-700 text-charcoal-800 dark:text-sand-100"
              >
                Sign In
              </Link>
              <Link
                to="/login?tab=register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-xl text-sm font-medium bg-brand-600 text-white"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
