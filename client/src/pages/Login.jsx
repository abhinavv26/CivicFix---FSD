import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, HardHat, Check } from 'lucide-react';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { login, register, isAuthenticated, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen'); // 'citizen' or 'staff'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDashboardPath]);

  // Demo credential autofill helper
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const loggedUser = await login(email, password);
        navigate(getDashboardPath(loggedUser.role), { replace: true });
      } else {
        const registeredUser = await register({
          name,
          email,
          password,
          role,
          phone,
        });
        navigate(getDashboardPath(registeredUser.role), { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-3xl p-6 sm:p-8 shadow-xl transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-sand-50">
            {activeTab === 'login' ? 'Welcome Back' : 'Create CivicFix Account'}
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            {activeTab === 'login'
              ? 'Access municipal tracking, issue logs and field alerts'
              : 'Join Mumbai’s civic resolution network'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-sand-100 dark:bg-charcoal-700/60 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-sand-50 shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-sand-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-sand-50 shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-sand-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              {/* Role selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('citizen')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-medium transition-all ${
                      role === 'citizen'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                        : 'border-sand-300 dark:border-charcoal-700 text-charcoal-600 dark:text-charcoal-300 hover:bg-sand-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="font-semibold text-xs leading-none">Citizen</p>
                      <p className="text-[10px] text-charcoal-400">Report issues</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-medium transition-all ${
                      role === 'staff'
                        ? 'border-terracotta-500 bg-terracotta-50/70 dark:bg-terracotta-950/40 text-terracotta-700 dark:text-terracotta-300 ring-2 ring-terracotta-500/20'
                        : 'border-sand-300 dark:border-charcoal-700 text-charcoal-600 dark:text-charcoal-300 hover:bg-sand-50'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-terracotta-600" />
                    <div>
                      <p className="font-semibold text-xs leading-none">Field Staff</p>
                      <p className="text-[10px] text-charcoal-400">Resolve tickets</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/40 dark:bg-charcoal-900/40 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/40 dark:bg-charcoal-900/40 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/40 dark:bg-charcoal-900/40 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/40 dark:bg-charcoal-900/40 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{activeTab === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Test Credentials Box */}
        <div className="mt-6 pt-5 border-t border-sand-100 dark:border-charcoal-700">
          <p className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider mb-2.5 text-center">
            Instant Demo Fill (1-Click)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@civicfix.com', 'Admin@123')}
              className="p-2 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-left transition-colors text-charcoal-800 dark:text-sand-200"
            >
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                Admin
              </span>
              <span className="text-[11px] font-medium block truncate">Admin@123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('staff@civicfix.com', 'Staff@123')}
              className="p-2 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-left transition-colors text-charcoal-800 dark:text-sand-200"
            >
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block uppercase">
                Staff
              </span>
              <span className="text-[11px] font-medium block truncate">Staff@123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@civicfix.com', 'Citizen@123')}
              className="p-2 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-left transition-colors text-charcoal-800 dark:text-sand-200"
            >
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                Citizen
              </span>
              <span className="text-[11px] font-medium block truncate">Citizen@123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
