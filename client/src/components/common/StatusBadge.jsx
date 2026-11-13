import React from 'react';

const statusConfig = {
  Reported: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  Assigned: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/40',
    dot: 'bg-blue-500',
  },
  'In Progress': {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800/40',
    dot: 'bg-purple-500 animate-pulse',
  },
  Resolved: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
};

export const StatusBadge = ({ status = 'Reported', size = 'sm' }) => {
  const cfg = statusConfig[status] || statusConfig.Reported;
  const sizeClasses = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} tracking-wide`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
