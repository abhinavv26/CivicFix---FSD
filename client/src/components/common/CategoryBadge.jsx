import React from 'react';
import { AlertCircle, Trash2, Lightbulb, Droplet, HelpCircle } from 'lucide-react';

const categoryConfig = {
  Pothole: {
    icon: AlertCircle,
    color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/40',
  },
  Garbage: {
    icon: Trash2,
    color: 'text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700',
  },
  Streetlight: {
    icon: Lightbulb,
    color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/40',
  },
  'Water Leakage': {
    icon: Droplet,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
  },
  Other: {
    icon: HelpCircle,
    color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
  },
};

export const CategoryBadge = ({ category = 'Other' }) => {
  const cfg = categoryConfig[category] || categoryConfig.Other;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
