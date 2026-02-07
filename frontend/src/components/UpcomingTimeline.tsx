import { format, differenceInDays } from 'date-fns';
import type { Bill } from '../data/mockBills';

interface UpcomingTimelineProps {
  bills: Bill[];
}

export default function UpcomingTimeline({ bills }: UpcomingTimelineProps) {
  const upcoming = bills
    .filter(b => b.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const today = new Date();

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
        Next Up
      </h3>
      <div className="space-y-0">
        {upcoming.map((bill, i) => {
          const daysUntil = differenceInDays(new Date(bill.dueDate), today);
          const isOverdue = daysUntil < 0;
          const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

          return (
            <div key={bill.id} className="flex items-center gap-3 py-2.5">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center w-4 shrink-0">
                <div className={`
                  w-2.5 h-2.5 rounded-full border-2
                  ${isOverdue ? 'border-accent-rose bg-accent-rose/30' :
                    isDueSoon ? 'border-accent-amber bg-accent-amber/30' :
                    'border-surface-4 bg-surface-3'}
                `} />
                {i < upcoming.length - 1 && (
                  <div className="w-px h-full min-h-[16px] bg-border-dim mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="min-w-0">
                  <div className="text-sm text-text-primary truncate">{bill.name}</div>
                  <div className={`text-xs ${isOverdue ? 'text-accent-rose' : isDueSoon ? 'text-accent-amber' : 'text-text-muted'}`}>
                    {isOverdue ? `${Math.abs(daysUntil)}d overdue` :
                     daysUntil === 0 ? 'Today' :
                     daysUntil === 1 ? 'Tomorrow' :
                     format(new Date(bill.dueDate), 'MMM d')}
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-text-secondary tabular-nums shrink-0 ml-2">
                  ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
