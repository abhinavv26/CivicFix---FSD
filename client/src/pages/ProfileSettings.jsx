import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { User, Lock, Moon, Sun, LogOut, CheckCircle2, Shield, Phone, Mail, Save } from 'lucide-react';

export const ProfileSettings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useNotification();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const res = await api.put('/users/profile', { name, phone, avatar });
      if (res.data.success) {
        updateUser(res.data.data);
        setProfileSuccess(true);
        addToast({
          title: 'Profile Updated',
          message: 'Your personal account details have been saved.',
          type: 'info',
        });
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast({
          title: 'Password Changed',
          message: 'Your account credentials have been updated.',
          type: 'info',
        });
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-sand-200 dark:border-charcoal-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Account Administration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
          Profile & Preferences
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Manage your identity details, notification preferences, and interface theme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Identity summary & Theme switch */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm text-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-sand-100 dark:ring-charcoal-700 mb-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}

            <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
              {user?.name}
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{user?.email}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-sand-200 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>{user?.role}</span>
            </div>
          </div>

          {/* Theme Settings Card */}
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">
              Interface Theme
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-charcoal-700 dark:text-sand-200">
                {theme === 'dark' ? 'Dark Charcoal Mode' : 'Warm Off-White Light'}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 transition-colors text-charcoal-700 dark:text-sand-200"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Logout card */}
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of CivicFix</span>
          </button>
        </div>

        {/* Right Side: Profile update & Password forms (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Edit Profile Information */}
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-sand-100 dark:border-charcoal-700 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
                Personal Information
              </h3>
              {profileSuccess && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 00000"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                Avatar Photo URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileSaving ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>

          {/* 2. Change Password */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-sand-100 dark:border-charcoal-700 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
                Change Password
              </h3>
              {passwordSuccess && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Password Changed</span>
                </span>
              )}
            </div>

            {passwordError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                New Password (Min 6 Characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2 rounded-xl bg-sand-800 hover:bg-sand-900 text-white dark:bg-sand-100 dark:text-charcoal-900 dark:hover:bg-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
