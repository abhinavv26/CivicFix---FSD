import React from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import { StatCardSkeleton } from '../components/common/LoadingSkeleton';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Wrench,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const STATUS_COLORS = {
  Reported: '#D97706',
  Assigned: '#2563EB',
  'In Progress': '#7C3AED',
  Resolved: '#059669',
};

const CATEGORY_COLORS = ['#EA580C', '#64748B', '#CA8A04', '#0284C7', '#475569'];

export const AdminDashboard = () => {
  const { data: statsData, loading, error, refetch } = useFetch('/admin/stats');

  const summary = statsData?.summary || {};
  const charts = statsData?.charts || {};
  const recentActivity = statsData?.recentActivity || [];

  const issuesByStatus = charts?.issuesByStatus || [];
  const issuesByCategory = (charts?.issuesByCategory || []).map((item) => ({
    name: item.category,
    value: item.count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Municipal Oversight Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Platform Analytics & Work Overview
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Real-time KPIs, department resolution speeds, and cross-ward ticket management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/issues"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Manage Issues
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-sand-100 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-sand-200 text-xs font-semibold shadow-xs transition-colors"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                <span>Total Reported</span>
                <Layers className="w-4 h-4 text-brand-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-charcoal-900 dark:text-sand-50">
                {summary.totalIssues || 0}
              </p>
              <p className="text-[11px] text-charcoal-400">Across all 24 wards</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                <span>In Progress</span>
                <Wrench className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-purple-600 dark:text-purple-400">
                {summary.inProgressCount || 0}
              </p>
              <p className="text-[11px] text-charcoal-400">Crews deployed in field</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                <span>Resolution Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.resolutionRate || 0}%
              </p>
              <p className="text-[11px] text-charcoal-400">
                {summary.resolvedCount || 0} tickets resolved
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                <span>Avg Resolution Time</span>
                <Clock className="w-4 h-4 text-terracotta-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-terracotta-600 dark:text-terracotta-400">
                {summary.avgResolutionHours || 24} hrs
              </p>
              <p className="text-[11px] text-charcoal-400">Target SLA: 48 hrs</p>
            </div>
          </>
        )}
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Issues by Status (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
                Issues Pipeline by Status
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                Current platform tickets grouped by operational stage
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#888888" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2024',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {issuesByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#184E3A'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Issues by Category (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
                Issues by Civic Category
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                Defect distribution across categories
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issuesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {issuesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2024',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sand-100 dark:border-charcoal-700 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
              Recent Platform Activity
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
              Latest municipal ticket updates and staff actions
            </p>
          </div>
          <Link
            to="/admin/issues"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-sand-100 dark:divide-charcoal-700/60">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-4 text-center">No recent activity logs.</p>
          ) : (
            recentActivity.map((issue) => (
              <div
                key={issue._id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-sand-50/50 dark:hover:bg-charcoal-700/30 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={issue.category} />
                    <Link
                      to={`/issues/${issue._id}`}
                      className="text-xs font-semibold text-charcoal-900 dark:text-sand-50 hover:text-brand-600 line-clamp-1"
                    >
                      {issue.title}
                    </Link>
                  </div>
                  <p className="text-[11px] text-charcoal-400">{issue.address}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={issue.status} size="xs" />
                  <span className="text-[11px] text-charcoal-400">
                    {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
