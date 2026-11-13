import React from 'react';
import { Search, Filter, LayoutGrid, List, Map } from 'lucide-react';

const CATEGORIES = ['All', 'Pothole', 'Garbage', 'Streetlight', 'Water Leakage', 'Other'];
const STATUSES = ['All', 'Reported', 'Assigned', 'In Progress', 'Resolved'];

export const IssueFilterBar = ({
  search = '',
  onSearchChange,
  category = 'All',
  onCategoryChange,
  status = 'All',
  onStatusChange,
  sortBy = 'newest',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
}) => {
  return (
    <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-4 shadow-sm space-y-3.5 mb-6">
      {/* Top row: Search input + Status dropdown + Sort dropdown + View toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, description or address..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/60 dark:bg-charcoal-900/60 text-charcoal-900 dark:text-sand-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filters and View controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-charcoal-500 dark:text-charcoal-400 whitespace-nowrap">
              Status:
            </span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/60 dark:bg-charcoal-900/60 text-charcoal-800 dark:text-sand-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-charcoal-500 dark:text-charcoal-400 whitespace-nowrap">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/60 dark:bg-charcoal-900/60 text-charcoal-800 dark:text-sand-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="status">By Status</option>
            </select>
          </div>

          {/* Optional Grid/List/Map View Toggle */}
          {showViewToggle && onViewModeChange && (
            <div className="flex items-center bg-sand-100 dark:bg-charcoal-700 p-0.5 rounded-xl ml-auto md:ml-0">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-charcoal-800 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-charcoal-500 hover:text-charcoal-700 dark:hover:text-sand-200'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-charcoal-800 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-charcoal-500 hover:text-charcoal-700 dark:hover:text-sand-200'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('map')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-charcoal-800 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-charcoal-500 hover:text-charcoal-700 dark:hover:text-sand-200'
                }`}
                title="Map view"
              >
                <Map className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Category Chip Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider mr-1 shrink-0">
          Category:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-brand-600 text-white font-medium shadow-xs'
                : 'bg-sand-100 hover:bg-sand-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-charcoal-700 dark:text-sand-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IssueFilterBar;
