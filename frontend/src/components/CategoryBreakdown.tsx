import type { Bill } from '../data/mockBills';

interface CategoryBreakdownProps {
  bills: Bill[];
}

export default function CategoryBreakdown({ bills }: CategoryBreakdownProps) {
  // Group by category name, track color alongside totals
  const grouped = bills.reduce<Record<string, { total: number; color: string }>>((acc, bill) => {
    if (!acc[bill.category]) {
      acc[bill.category] = { total: 0, color: bill.categoryColor };
    }
    acc[bill.category].total += bill.amount;
    return acc;
  }, {});

  const sorted = Object.entries(grouped)
    .sort(([, a], [, b]) => b.total - a.total);

  const max = sorted[0]?.[1].total || 1;

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
        By Category
      </h3>
      <div className="space-y-3">
        {sorted.map(([cat, { total, color }]) => {
          const pct = (total / max) * 100;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color }}>{cat}</span>
                <span className="text-xs font-mono text-text-secondary tabular-nums">
                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
