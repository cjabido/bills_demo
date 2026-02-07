import { DollarSign, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import type { Bill } from '../data/mockBills';

interface SummaryCardsProps {
  bills: Bill[];
}

export default function SummaryCards({ bills }: SummaryCardsProps) {
  const unpaid = bills.filter(b => b.status !== 'paid');
  const paid = bills.filter(b => b.status === 'paid');
  const overdue = bills.filter(b => b.status === 'overdue');

  const totalDue = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = paid.reduce((sum, b) => sum + b.amount, 0);
  const overdueTotal = overdue.reduce((sum, b) => sum + b.amount, 0);

  const cards = [
    {
      label: 'Total Due',
      value: totalDue,
      count: unpaid.length,
      countLabel: 'bills remaining',
      icon: Clock,
      accent: 'text-accent-amber',
      accentBg: 'bg-accent-amber-dim',
      border: 'border-accent-amber/10',
    },
    {
      label: 'Paid This Month',
      value: totalPaid,
      count: paid.length,
      countLabel: 'bills paid',
      icon: DollarSign,
      accent: 'text-accent-mint',
      accentBg: 'bg-accent-mint-dim',
      border: 'border-accent-mint/10',
    },
    {
      label: 'Monthly Total',
      value: totalDue + totalPaid,
      count: bills.length,
      countLabel: 'total bills',
      icon: TrendingDown,
      accent: 'text-accent-sky',
      accentBg: 'bg-accent-sky-dim',
      border: 'border-accent-sky/10',
    },
    {
      label: 'Overdue',
      value: overdueTotal,
      count: overdue.length,
      countLabel: overdue.length === 1 ? 'bill overdue' : 'bills overdue',
      icon: AlertTriangle,
      accent: overdue.length > 0 ? 'text-accent-rose' : 'text-text-muted',
      accentBg: overdue.length > 0 ? 'bg-accent-rose-dim' : 'bg-surface-3',
      border: overdue.length > 0 ? 'border-accent-rose/10' : 'border-border-dim',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`
            relative overflow-hidden
            bg-surface-1 border ${card.border} rounded-xl
            p-4 animate-fade-in-up
          `}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.accentBg}`}>
              <card.icon className={`w-3.5 h-3.5 ${card.accent}`} />
            </div>
          </div>
          <div className={`text-2xl font-mono font-semibold tabular-nums ${card.accent}`}>
            ${card.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {card.count} {card.countLabel}
          </div>

          {/* Subtle background glow */}
          <div className={`
            absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.04]
            ${card.accentBg.replace('-dim', '')}
            blur-2xl
          `} />
        </div>
      ))}
    </div>
  );
}
