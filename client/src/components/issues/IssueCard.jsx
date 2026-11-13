import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { MapPin, ThumbsUp, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

export const IssueCard = ({ issue, onUpvote, userHasUpvoted = false }) => {
  if (!issue) return null;

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const upvoteCount = issue.upvotes ? issue.upvotes.length : issue.upvoteCount || 0;
  const thumbnail =
    issue.images && issue.images.length > 0
      ? issue.images[0]
      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';

  return (
    <article className="group bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Thumbnail + Overlays */}
      <div className="relative h-44 w-full bg-sand-100 dark:bg-charcoal-700 overflow-hidden">
        <img
          src={thumbnail}
          alt={issue.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <CategoryBadge category={issue.category} />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={issue.status} size="xs" />
        </div>

        {issue.status === 'Resolved' && (
          <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-3 h-3" />
            <span>Resolved</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/issues/${issue._id}`}>
            <h3 className="font-serif font-bold text-sm text-charcoal-900 dark:text-sand-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
              {issue.title}
            </h3>
          </Link>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Address & Meta */}
        <div className="space-y-2 pt-2 border-t border-sand-100 dark:border-charcoal-700/60">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 dark:text-charcoal-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-terracotta-500" />
            <span className="truncate">{issue.address || 'Mumbai, India'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-charcoal-400 dark:text-charcoal-500">
            <div className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Upvote Button / Indicator */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (onUpvote) onUpvote(issue._id);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                  userHasUpvoted
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                    : 'text-charcoal-600 dark:text-charcoal-300 hover:bg-sand-100 dark:hover:bg-charcoal-700'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${userHasUpvoted ? 'fill-current' : ''}`} />
                <span>{upvoteCount}</span>
              </button>

              {/* View detail link */}
              <Link
                to={`/issues/${issue._id}`}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default IssueCard;
