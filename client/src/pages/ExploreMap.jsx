import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import InteractiveMap from '../components/issues/InteractiveMap';
import IssueCard from '../components/issues/IssueCard';
import IssueFilterBar from '../components/issues/IssueFilterBar';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { MapPin, Layers, Map, Grid, List } from 'lucide-react';

export const ExploreMap = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('map'); // 'map', 'grid', 'list'
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Fetch all issues
  const {
    data: issuesData,
    loading,
    error,
    refetch,
    setData,
  } = useFetch('/issues', {
    params: {
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      search: search || undefined,
      sortBy,
      limit: 100, // Explore map shows up to 100 pins across Mumbai
    },
  });

  const issues = Array.isArray(issuesData) ? issuesData : issuesData?.data || [];

  // Socket listener for live additions or updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      refetch();
    };

    socket.on('issue:list_update', handleUpdate);

    return () => {
      socket.off('issue:list_update', handleUpdate);
    };
  }, [socket, refetch]);

  // Handle upvote toggle
  const handleUpvote = async (issueId) => {
    try {
      const res = await api.post(`/issues/${issueId}/upvote`);
      if (res.data.success) {
        setData((prev) => {
          const list = Array.isArray(prev) ? prev : prev?.data || [];
          const updated = list.map((item) => {
            if (item._id === issueId) {
              const currentUpvotes = item.upvotes || [];
              const hasUpvoted = currentUpvotes.includes(user?._id || user?.id);
              return {
                ...item,
                upvotes: hasUpvoted
                  ? currentUpvotes.filter((id) => id !== (user?._id || user?.id))
                  : [...currentUpvotes, user?._id || user?.id],
              };
            }
            return item;
          });
          return Array.isArray(prev) ? updated : { ...prev, data: updated };
        });
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Mumbai Civic Observability
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Explore Pinned City Issues
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Browse active civic tickets across Mumbai with live geographic pins and status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-charcoal-600 dark:text-sand-300 bg-white dark:bg-charcoal-800 border border-sand-300 dark:border-charcoal-700 px-3 py-1.5 rounded-xl shadow-xs">
          <MapPin className="w-4 h-4 text-emerald-500" />
          <span>{issues.length} Issues Mapped</span>
        </div>
      </div>

      {/* Filter Bar */}
      <IssueFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
      />

      {/* View Content */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found on map"
          description="Try broadening your category or status filter to see other Mumbai wards."
        />
      ) : viewMode === 'map' ? (
        /* Split Map & Drawer Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[600px]">
          {/* Interactive Map (8 cols) */}
          <div className="lg:col-span-8 h-[550px] lg:h-[650px]">
            <InteractiveMap
              issues={issues}
              selectedIssueId={selectedIssue?._id}
              onMarkerClick={(issue) => setSelectedIssue(issue)}
            />
          </div>

          {/* Quick Issue Feed Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col h-[550px] lg:h-[650px] bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-charcoal-700">
              <h3 className="font-serif font-bold text-sm text-charcoal-900 dark:text-sand-50">
                Tickets in Focus
              </h3>
              <span className="text-[11px] text-charcoal-400 font-sans">
                {issues.length} results
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pt-3 pr-1">
              {issues.map((issue) => {
                const hasUpvoted = (issue.upvotes || []).includes(user?._id || user?.id);

                return (
                  <div
                    key={issue._id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`cursor-pointer transition-all ${
                      selectedIssue?._id === issue._id
                        ? 'ring-2 ring-brand-500 rounded-2xl'
                        : ''
                    }`}
                  >
                    <IssueCard
                      issue={issue}
                      onUpvote={handleUpvote}
                      userHasUpvoted={hasUpvoted}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => {
            const hasUpvoted = (issue.upvotes || []).includes(user?._id || user?.id);
            return (
              <IssueCard
                key={issue._id}
                issue={issue}
                onUpvote={handleUpvote}
                userHasUpvoted={hasUpvoted}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => {
            const hasUpvoted = (issue.upvotes || []).includes(user?._id || user?.id);
            return (
              <IssueCard
                key={issue._id}
                issue={issue}
                onUpvote={handleUpvote}
                userHasUpvoted={hasUpvoted}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreMap;
