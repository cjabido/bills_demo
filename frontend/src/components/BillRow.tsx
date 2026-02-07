import { format, isPast, differenceInDays } from 'date-fns';
import {
  Check,
  RotateCcw,
  AlertTriangle,
  Clock,
  CreditCard,
  Zap,
  Pencil,
} from 'lucide-react';
import type { Bill, BillStatus } from '../data/mockBills';

interface BillRowProps {
  bill: Bill;
  onMarkPaid: (bill: Bill) => void;
  onEdit?: (bill: Bill) => void;
  style?: React.CSSProperties;
}

function StatusIndicator({ status, dueDate }: { status: BillStatus; dueDate: string }) {
  const daysUntil = differenceInDays(new Date(dueDate), new Date());

  if (status === 'paid') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-accent-mint" />
        <span className="text-xs text-accent-mint font-medium">Paid</span>
      </div>
    );
  }
  if (status === 'overdue' || isPast(new Date(dueDate))) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse-glow" />
        <span className="text-xs text-accent-rose font-medium">Overdue</span>
      </div>
    );
  }
  if (daysUntil <= 3) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-accent-amber" />
        <span className="text-xs text-accent-amber font-medium">Due soon</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-surface-4" />
      <span className="text-xs text-text-muted font-medium">Upcoming</span>
    </div>
  );
}

function getDueDateLabel(bill: Bill): string {
  if (bill.status === 'paid' && bill.paidDate) {
    return `Paid ${format(new Date(bill.paidDate), 'MMM d')}`;
  }
  const daysUntil = differenceInDays(new Date(bill.dueDate), new Date());
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  if (daysUntil < 0) return `${Math.abs(daysUntil)}d overdue`;
  return `Due ${format(new Date(bill.dueDate), 'MMM d')}`;
}

function getRowBorderColor(bill: Bill): string {
  if (bill.status === 'paid') return 'border-l-accent-mint/30';
  if (bill.status === 'overdue' || isPast(new Date(bill.dueDate))) return 'border-l-accent-rose/60';
  const daysUntil = differenceInDays(new Date(bill.dueDate), new Date());
  if (daysUntil <= 3) return 'border-l-accent-amber/50';
  return 'border-l-transparent';
}

export default function BillRow({ bill, onMarkPaid, onEdit, style }: BillRowProps) {
  const isPaid = bill.status === 'paid';

  return (
    <div
      className={`
        group relative flex items-center gap-4 px-4 py-3.5
        bg-surface-1 border border-border-dim rounded-lg
        border-l-2 ${getRowBorderColor(bill)}
        hover:bg-surface-2 hover:border-border-default
        transition-all duration-200
      `}
      style={style}
    >
      {/* Left: Icon + Name + Category */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isPaid ? 'bg-accent-mint-dim' : ''}`}
          style={isPaid ? undefined : { backgroundColor: bill.categoryColor + '1a' }}
        >
          {isPaid ? (
            <Check className="w-4 h-4 text-accent-mint" />
          ) : bill.status === 'overdue' ? (
            <AlertTriangle className="w-4 h-4 text-accent-rose" />
          ) : (
            <CreditCard className="w-4 h-4" style={{ color: bill.categoryColor }} />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${isPaid ? 'text-text-secondary' : 'text-text-primary'}`}>
              {bill.name}
            </span>
            {bill.isRecurring && (
              <RotateCcw className="w-3 h-3 text-text-muted shrink-0" />
            )}
            {bill.autopay && (
              <Zap className="w-3 h-3 text-accent-amber shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: bill.categoryColor + '1a', color: bill.categoryColor }}
            >
              {bill.category}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Date + Status */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className={`text-xs ${isPaid ? 'text-text-muted' : 'text-text-secondary'}`}>
          <Clock className="w-3 h-3 inline mr-1 relative -top-px" />
          {getDueDateLabel(bill)}
        </span>
        <StatusIndicator status={bill.status} dueDate={bill.dueDate} />
      </div>

      {/* Right: Amount + Action */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`
          text-sm font-mono font-semibold tabular-nums
          ${isPaid ? 'text-text-muted line-through' : 'text-text-primary'}
        `}>
          ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>

        {!isPaid && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
            {onEdit && (
              <button
                onClick={() => onEdit(bill)}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  bg-surface-3 hover:bg-surface-4
                  text-text-muted hover:text-text-secondary
                  transition-all duration-150
                  cursor-pointer
                "
                title="Edit bill"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onMarkPaid(bill)}
              className="
                w-8 h-8 rounded-lg flex items-center justify-center
                bg-accent-mint-dim hover:bg-accent-mint/20
                text-accent-mint
                transition-all duration-150
                cursor-pointer
              "
              title="Mark as paid"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
