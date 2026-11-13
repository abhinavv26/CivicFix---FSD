import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import EmptyState from '../components/common/EmptyState';
import { Bell, CheckCheck, Clock, ExternalLink, Filter } from 'lucide-react';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotification();
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
    }
    const issueId = n.issue?._id || n.issue;
    if (issueId) {
      navigate(`/issues/${issueId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Inbox & Alerts
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Notifications Center
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Real-time updates on assignments, status transitions, comments, and upvotes.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-sand-100 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-sand-200 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-sand-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-sand-300 hover:bg-sand-200'
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-brand-600 text-white'
              : 'bg-sand-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-sand-300 hover:bg-sand-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread alerts' : 'No notifications yet'}
          description="You will be notified live whenever an issue changes status, receives work updates, or gets assigned."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const timeAgo = new Date(n.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-white dark:bg-charcoal-800 border-brand-300 dark:border-brand-800/80 shadow-xs ring-1 ring-brand-500/10'
                    : 'bg-sand-50/60 dark:bg-charcoal-800/40 border-sand-200/80 dark:border-charcoal-700/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      !n.isRead
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'bg-sand-100 text-charcoal-400 dark:bg-charcoal-700 dark:text-charcoal-400'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-charcoal-900 dark:text-sand-50">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-charcoal-600 dark:text-charcoal-300">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-charcoal-400 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                      {n.sender?.name && <span>• by {n.sender.name}</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ExternalLink className="w-4 h-4 text-charcoal-400 hover:text-brand-600 dark:hover:text-brand-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
