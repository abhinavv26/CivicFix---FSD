import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-5 shadow-sm animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-5 bg-sand-200 dark:bg-charcoal-700 rounded-full w-24"></div>
      <div className="h-5 bg-sand-200 dark:bg-charcoal-700 rounded-full w-20"></div>
    </div>
    <div className="h-6 bg-sand-200 dark:bg-charcoal-700 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3.5 bg-sand-200 dark:bg-charcoal-700 rounded w-full"></div>
      <div className="h-3.5 bg-sand-200 dark:bg-charcoal-700 rounded w-4/5"></div>
    </div>
    <div className="pt-3 border-t border-sand-100 dark:border-charcoal-700 flex justify-between items-center">
      <div className="h-4 bg-sand-200 dark:bg-charcoal-700 rounded w-1/3"></div>
      <div className="h-4 bg-sand-200 dark:bg-charcoal-700 rounded w-16"></div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse border-b border-sand-100 dark:border-charcoal-700">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-sand-200 dark:bg-charcoal-700 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

export const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-5 shadow-sm animate-pulse space-y-3">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-sand-200 dark:bg-charcoal-700 rounded w-24"></div>
      <div className="w-8 h-8 rounded-xl bg-sand-200 dark:bg-charcoal-700"></div>
    </div>
    <div className="h-8 bg-sand-200 dark:bg-charcoal-700 rounded w-16"></div>
    <div className="h-3 bg-sand-200 dark:bg-charcoal-700 rounded w-32"></div>
  </div>
);

export default { CardSkeleton, TableRowSkeleton, StatCardSkeleton };
