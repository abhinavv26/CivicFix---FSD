import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active items matching your criteria at this moment.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white/50 dark:bg-charcoal-800/50 border border-dashed border-sand-300 dark:border-charcoal-700 rounded-2xl max-w-md mx-auto my-6">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-sand-100 dark:bg-charcoal-700 flex items-center justify-center text-charcoal-400 dark:text-charcoal-300">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-charcoal-900 dark:text-sand-50">
        {title}
      </h3>
      <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>

      {actionLabel && (actionLink || onAction) && (
        <div className="mt-4">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
