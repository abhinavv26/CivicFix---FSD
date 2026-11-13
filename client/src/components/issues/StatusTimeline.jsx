import React from 'react';
import { Check, Clock, UserCheck, Wrench, CheckCircle2 } from 'lucide-react';

const stepConfig = {
  Reported: {
    icon: Clock,
    color: 'bg-amber-500 text-white',
    ring: 'ring-amber-200 dark:ring-amber-900',
  },
  Assigned: {
    icon: UserCheck,
    color: 'bg-blue-500 text-white',
    ring: 'ring-blue-200 dark:ring-blue-900',
  },
  'In Progress': {
    icon: Wrench,
    color: 'bg-purple-500 text-white',
    ring: 'ring-purple-200 dark:ring-purple-900',
  },
  Resolved: {
    icon: CheckCircle2,
    color: 'bg-emerald-500 text-white',
    ring: 'ring-emerald-200 dark:ring-emerald-900',
  },
};

export const StatusTimeline = ({ statusHistory = [], currentStatus = 'Reported' }) => {
  const steps = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
  const currentStepIndex = steps.indexOf(currentStatus);

  return (
    <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-serif font-bold text-charcoal-900 dark:text-sand-50 mb-6 flex items-center justify-between">
        <span>Resolution Progress Timeline</span>
        <span className="text-xs font-sans font-medium text-charcoal-500 dark:text-charcoal-400">
          Status: <strong className="text-charcoal-800 dark:text-sand-100">{currentStatus}</strong>
        </span>
      </h3>

      {/* Progress pipeline bar */}
      <div className="relative mb-8 px-4">
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-sand-200 dark:bg-charcoal-700 -z-0">
          <div
            className="h-full bg-brand-600 transition-all duration-500"
            style={{
              width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
            }}
          />
        </div>

        <div className="relative z-10 flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const cfg = stepConfig[step];
            const Icon = cfg.icon;

            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? `${cfg.color} shadow-md ring-4 ${cfg.ring}`
                      : 'bg-sand-200 dark:bg-charcoal-700 text-charcoal-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium ${
                    isCurrent
                      ? 'text-charcoal-900 dark:text-sand-50 font-semibold'
                      : isCompleted
                      ? 'text-charcoal-700 dark:text-sand-200'
                      : 'text-charcoal-400 dark:text-charcoal-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Log */}
      <div className="border-t border-sand-100 dark:border-charcoal-700 pt-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500">
          Event History & Actions
        </h4>

        {statusHistory.length === 0 ? (
          <p className="text-xs text-charcoal-500">No history events logged yet.</p>
        ) : (
          <div className="space-y-3">
            {statusHistory
              .slice()
              .reverse()
              .map((item, idx) => {
                const cfg = stepConfig[item.status] || stepConfig.Reported;
                const Icon = cfg.icon;

                return (
                  <div
                    key={item._id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-sand-50/70 dark:bg-charcoal-700/40 border border-sand-200/60 dark:border-charcoal-700/60"
                  >
                    <div className={`p-1.5 rounded-lg ${cfg.color} shrink-0 mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-charcoal-900 dark:text-sand-100">
                          {item.status}
                        </span>
                        <span className="text-[11px] text-charcoal-400 dark:text-charcoal-500">
                          {new Date(item.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {item.note && (
                        <p className="text-xs text-charcoal-600 dark:text-charcoal-300 mt-1">
                          {item.note}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-charcoal-400 dark:text-charcoal-500">
                        <span>
                          Updated by{' '}
                          <strong className="text-charcoal-700 dark:text-sand-300 font-medium">
                            {item.changedBy?.name || 'Authorized Member'}
                          </strong>{' '}
                          ({item.changedBy?.role || 'Staff'})
                        </span>
                      </div>

                      {item.proofImage && (
                        <div className="mt-2.5">
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block mb-1">
                            Proof of Resolution:
                          </span>
                          <img
                            src={item.proofImage}
                            alt="Resolution proof"
                            className="w-32 h-20 object-cover rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTimeline;
