import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'status_change' || toast.type === 'resolved';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 dark:bg-charcoal-800/95 backdrop-blur border border-sand-200 dark:border-charcoal-700 shadow-xl rounded-xl p-3.5 flex items-start gap-3 transition-all duration-300 transform translate-y-0"
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400'
              }`}
            >
              {isSuccess ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-charcoal-900 dark:text-sand-50 leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
              {toast.issueId && (
                <Link
                  to={`/issues/${toast.issueId}`}
                  onClick={() => removeToast(toast.id)}
                  className="inline-block mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View Ticket →
                </Link>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-sand-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
