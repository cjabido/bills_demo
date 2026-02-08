import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  TrendingUp,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  Camera,
  Wallet,
  PiggyBank,
  Landmark,
  ShieldCheck,
  Bitcoin,
  Heart,
  BadgeDollarSign,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import {
  ASSET_CATEGORY_CONFIG,
  INVESTMENT_TYPE_LABELS,
  type AssetAccount,
  type AssetCategory,
  type PortfolioSnapshot,
  type GrowthPoint,
  type InvestmentType,
} from '../data/mockAssets';
import { useAssetAccounts, useAssetHistory, useNetWorth } from '../hooks/useAssets';
import { useInvestments, useCreateInvestment, useMarkContributed, type RecurringInvestment } from '../hooks/useInvestments';
import AddContributionModal from './AddContributionModal';
import MarkContributedModal from './MarkContributedModal';

// --- Helpers ---

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function gainPct(balance: number, cost: number) {
  if (cost === 0) return 0;
  return ((balance - cost) / cost) * 100;
}

const TYPE_ICON: Record<InvestmentType, React.ElementType> = {
  '401k': Landmark,
  roth_ira: ShieldCheck,
  trad_ira: Landmark,
  brokerage: TrendingUp,
  hsa: Heart,
  savings: PiggyBank,
  checking: Wallet,
  crypto: Bitcoin,
};

// --- Growth Chart ---

type TimePeriod = '1M' | '3M' | '6M' | '1Y' | 'ALL';

function GrowthChart({ data, period, onPeriodChange }: {
  data: GrowthPoint[];
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
}) {
  const periodButtons: TimePeriod[] = ['1M', '3M', '6M', '1Y', 'ALL'];

  if (data.length < 2) {
    return (
      <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Portfolio Growth</h3>
        <div className="flex items-center justify-center h-[200px] text-sm text-text-muted">
          Not enough data to chart yet
        </div>
      </div>
    );
  }

  const sliceCount = {
    '1M': 2,
    '3M': 3,
    '6M': 6,
    '1Y': 12,
    'ALL': data.length,
  }[period];

  const visible = data.slice(-sliceCount);
  const values = visible.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 720;
  const height = 200;
  const padX = 48;
  const padTop = 16;
  const padBot = 28;
  const usableW = width - padX * 2;
  const usableH = height - padTop - padBot;

  const pts = visible.map((d, i) => ({
    x: padX + (i / Math.max(visible.length - 1, 1)) * usableW,
    y: padTop + usableH - ((d.value - min) / range) * usableH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${height - padBot} L ${pts[0].x},${height - padBot} Z`;

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const changePct = ((change / first) * 100).toFixed(1);
  const isPositive = change >= 0;

  // Y-axis grid lines (4 evenly spaced)
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    const y = padTop + usableH - (i / 4) * usableH;
    return { val, y };
  });

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Portfolio Growth</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? 'text-accent-mint' : 'text-accent-rose'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPositive ? '+' : ''}{changePct}%
            </span>
            <span className={`text-xs font-mono tabular-nums ${isPositive ? 'text-accent-mint' : 'text-accent-rose'}`}>
              ({isPositive ? '+' : '-'}${fmt(Math.abs(change))})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-surface-2 border border-border-dim rounded-lg">
          {periodButtons.map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer
                ${period === p
                  ? 'bg-surface-1 text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'} stopOpacity="0.12" />
            <stop offset="100%" stopColor={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={padX} y1={gl.y} x2={width - padX} y2={gl.y}
              stroke="var(--color-border-dim)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text
              x={padX - 8} y={gl.y + 3}
              textAnchor="end"
              fill="var(--color-text-muted)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {fmtCompact(gl.val)}
            </text>
          </g>
        ))}

        {/* Area + Line */}
        <path d={areaPath} fill="url(#growthFill)" />
        <path
          d={linePath}
          fill="none"
          stroke={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End dot */}
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r="4"
          fill={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'}
        />
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r="8"
          fill={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'}
          opacity="0.15"
        />

        {/* X-axis labels */}
        {pts.map((p, i) => {
          // Only show every N labels to avoid crowding
          const step = visible.length <= 6 ? 1 : visible.length <= 8 ? 2 : 3;
          if (i % step !== 0 && i !== pts.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x} y={height - 8}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize="10"
              fontFamily="var(--font-sans)"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// --- Allocation Bar ---

function AllocationBar({ categories }: {
  categories: { key: AssetCategory; total: number }[];
}) {
  const grand = categories.reduce((s, c) => s + c.total, 0);
  if (grand === 0) return null;

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Asset Allocation</h3>

      {/* Stacked bar */}
      <div className="h-3 rounded-full bg-surface-2 overflow-hidden flex mb-4">
        {categories.map(c => {
          const cfg = ASSET_CATEGORY_CONFIG[c.key];
          const pct = (c.total / grand) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={c.key}
              className={`h-full first:rounded-l-full last:rounded-r-full`}
              style={{
                width: `${pct}%`,
                backgroundColor: `var(--color-${cfg.accent})`,
                opacity: 0.65,
              }}
              title={`${cfg.label}: $${fmt(c.total)} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(c => {
          const cfg = ASSET_CATEGORY_CONFIG[c.key];
          const pct = ((c.total / grand) * 100).toFixed(1);
          return (
            <div key={c.key} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: `var(--color-${cfg.accent})`, opacity: 0.65 }}
                />
                <span className="text-xs text-text-muted">{cfg.label}</span>
              </div>
              <div className="text-sm font-mono font-semibold tabular-nums text-text-primary">
                ${fmt(c.total)}
              </div>
              <div className="text-[10px] text-text-muted">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Add Snapshot Modal ---

interface AddSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (snapshot: Omit<PortfolioSnapshot, 'id'>) => void;
}

function AddSnapshotModal({ isOpen, onClose, onAdd }: AddSnapshotModalProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalValue, setTotalValue] = useState('');
  const [retirement, setRetirement] = useState('');
  const [taxable, setTaxable] = useState('');
  const [cash, setCash] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalValue || !date) return;
    onAdd({
      date,
      totalValue: parseFloat(totalValue),
      retirement: parseFloat(retirement) || 0,
      taxable: parseFloat(taxable) || 0,
      cash: parseFloat(cash) || 0,
    });
    setDate(new Date().toISOString().slice(0, 10));
    setTotalValue('');
    setRetirement('');
    setTaxable('');
    setCash('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface-1 border border-border-default rounded-2xl shadow-2xl shadow-black/10 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">Add Snapshot</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
              required
            />
          </div>

          {/* Total Value */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Total Portfolio Value</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
              <input
                type="number"
                step="0.01"
                value={totalValue}
                onChange={e => setTotalValue(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                required
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Retirement</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={retirement}
                  onChange={e => setRetirement(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-2 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Taxable</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={taxable}
                  onChange={e => setTaxable(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-2 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Cash</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={cash}
                  onChange={e => setCash(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-2 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-lg bg-accent-sky/15 hover:bg-accent-sky/25 text-accent-sky text-sm font-semibold border border-accent-sky/20 hover:border-accent-sky/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Save Snapshot
          </button>
        </form>
      </div>
    </div>
  );
}


// --- Main Page ---

type SortField = 'date' | 'totalValue' | 'change';
type SortDir = 'asc' | 'desc';

export default function AssetTrackerPage() {
  const { data: rawAccounts = [], isLoading: accountsLoading, isError: accountsError } = useAssetAccounts();
  const { data: rawHistory = [], isLoading: historyLoading } = useAssetHistory(undefined, 12);
  const { data: _netWorthData } = useNetWorth();

  // Map raw backend accounts to AssetAccount shape
  // Backend tracks isTaxable for investment accounts to distinguish retirement vs taxable
  const accounts: AssetAccount[] = useMemo(() => {
    return rawAccounts.map(a => {
      let category: AssetCategory;
      let investmentType: InvestmentType;

      if (a.type === 'investment') {
        // Use isTaxable to determine if retirement or taxable brokerage
        category = a.isTaxable ? 'taxable' : 'retirement';
        investmentType = a.isTaxable ? 'brokerage' : '401k';
      } else if (a.type === 'savings') {
        category = 'cash';
        investmentType = 'savings';
      } else if (a.type === 'checking') {
        category = 'cash';
        investmentType = 'checking';
      } else {
        category = 'other';
        investmentType = 'savings';
      }

      return {
        id: a.id,
        name: a.name,
        institution: a.institution,
        lastFour: a.lastFour,
        category,
        investmentType,
        balance: Number(a.balance),
        costBasis: Number(a.balance), // No cost basis from backend yet
        lastUpdated: a.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      };
    });
  }, [rawAccounts]);

  // Build growth data from history snapshots
  const growthData: GrowthPoint[] = useMemo(() => {
    if (rawHistory.length === 0) return [];
    // Group snapshots by month
    const byMonth = new Map<string, number>();
    for (const snap of rawHistory) {
      const date = snap.date.slice(0, 7); // YYYY-MM
      byMonth.set(date, (byMonth.get(date) ?? 0) + Number(snap.balance));
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({
        date: `${month}-01`,
        label: new Date(`${month}-01`).toLocaleString('default', { month: 'short' }),
        value,
      }));
  }, [rawHistory]);

  // Build snapshot-like data for table from history
  const snapshots: PortfolioSnapshot[] = useMemo(() => {
    if (rawHistory.length === 0) return [];
    // Group by date, sum up categories
    const byDate = new Map<string, { total: number; retirement: number; taxable: number; cash: number }>();
    for (const snap of rawHistory) {
      const date = snap.date;
      if (!byDate.has(date)) byDate.set(date, { total: 0, retirement: 0, taxable: 0, cash: 0 });
      const entry = byDate.get(date)!;
      const bal = Number(snap.balance);
      entry.total += bal;
      // Use account type to categorize
      const accType = snap.account?.type ?? '';
      if (accType === 'investment') entry.taxable += bal;
      else if (accType === 'savings' || accType === 'checking') entry.cash += bal;
      else entry.retirement += bal;
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, vals], i) => ({
        id: `snap-${i}`,
        date,
        totalValue: vals.total,
        retirement: vals.retirement,
        taxable: vals.taxable,
        cash: vals.cash,
      }));
  }, [rawHistory]);

  const { data: investments = [] } = useInvestments();
  const createInvestmentMutation = useCreateInvestment();
  const markContributedMutation = useMarkContributed();

  const [period, setPeriod] = useState<TimePeriod>('1Y');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<AssetCategory>>(new Set());
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [markContributedInvestment, setMarkContributedInvestment] = useState<RecurringInvestment | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const isLoading = accountsLoading || historyLoading;
  const isError = accountsError;

  // --- Computed ---

  const totalNetWorth = useMemo(
    () => accounts.reduce((s, a) => s + a.balance, 0),
    [accounts]
  );

  const totalCostBasis = useMemo(
    () => accounts.reduce((s, a) => s + a.costBasis, 0),
    [accounts]
  );

  const totalGain = totalNetWorth - totalCostBasis;
  const totalGainPct = gainPct(totalNetWorth, totalCostBasis);

  const previousValue = snapshots.length >= 2 ? snapshots[1].totalValue : totalNetWorth;
  const monthChange = totalNetWorth - previousValue;
  const monthChangePct = previousValue > 0 ? ((monthChange / previousValue) * 100).toFixed(1) : '0.0';

  const categoryTotals = useMemo(() => {
    const cats: AssetCategory[] = ['retirement', 'taxable', 'cash', 'other'];
    return cats.map(key => ({
      key,
      total: accounts.filter(a => a.category === key).reduce((s, a) => s + a.balance, 0),
    })).filter(c => c.total > 0);
  }, [accounts]);

  const groupedAccounts = useMemo(() => {
    const cats: AssetCategory[] = ['retirement', 'taxable', 'cash', 'other'];
    return cats.map(cat => ({
      category: cat,
      config: ASSET_CATEGORY_CONFIG[cat],
      accounts: accounts.filter(a => a.category === cat),
      total: accounts.filter(a => a.category === cat).reduce((s, a) => s + a.balance, 0),
    })).filter(g => g.accounts.length > 0);
  }, [accounts]);

  const sortedSnapshots = useMemo(() => {
    const sorted = [...snapshots];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = a.date.localeCompare(b.date);
      } else if (sortField === 'totalValue') {
        cmp = a.totalValue - b.totalValue;
      } else {
        // change: compare against next snapshot
        const aIdx = snapshots.indexOf(a);
        const bIdx = snapshots.indexOf(b);
        const aChange = aIdx < snapshots.length - 1 ? a.totalValue - snapshots[aIdx + 1].totalValue : 0;
        const bChange = bIdx < snapshots.length - 1 ? b.totalValue - snapshots[bIdx + 1].totalValue : 0;
        cmp = aChange - bChange;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [snapshots, sortField, sortDir]);

  // --- Actions ---

  const toggleCategory = (cat: AssetCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleAddSnapshot = (_snapshot: Omit<PortfolioSnapshot, 'id'>) => {
    // Backend snapshot API expects { accountId, date, balance, costBasis }
    // The frontend modal produces a different shape. This would need adaptation.
  };

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load asset data. Check that the server is running.</p></div>;

  return (
    <div className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-mint-dim flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent-mint" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Assets</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowContributionModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-violet/10 hover:bg-accent-violet/20 text-accent-violet text-xs font-semibold border border-accent-violet/15 hover:border-accent-violet/25 transition-all duration-150 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Add Contribution
              </button>
              <button
                onClick={() => setShowSnapshotModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-sky/10 hover:bg-accent-sky/20 text-accent-sky text-xs font-semibold border border-accent-sky/15 hover:border-accent-sky/25 transition-all duration-150 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Add Snapshot
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Net Worth Hero */}
        <div className="bg-surface-1 border border-border-dim rounded-xl p-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Net Worth</span>
              <div className="text-3xl sm:text-4xl font-mono font-bold tabular-nums text-text-primary mt-1">
                ${fmt(totalNetWorth)}
              </div>
              <div className="flex items-center gap-3 mt-2">
                {/* Month change */}
                <div className="flex items-center gap-1">
                  {monthChange >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-accent-mint" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-accent-rose" />
                  )}
                  <span className={`text-sm font-medium ${monthChange >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                    {monthChange >= 0 ? '+' : ''}{monthChangePct}%
                  </span>
                  <span className="text-xs text-text-muted">vs last month</span>
                </div>
              </div>
            </div>
            {/* All-time gain */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Unrealized Gain</span>
                <span className={`text-lg font-mono font-semibold tabular-nums ${totalGain >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                  {totalGain >= 0 ? '+' : '-'}${fmt(Math.abs(totalGain))}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Return</span>
                <span className={`text-lg font-mono font-semibold tabular-nums ${totalGainPct >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                  {totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(1)}%
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Cost Basis</span>
                <span className="text-lg font-mono font-semibold tabular-nums text-text-secondary">
                  ${fmt(totalCostBasis)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation + Chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
          <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <AllocationBar categories={categoryTotals} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <GrowthChart data={growthData} period={period} onPeriodChange={setPeriod} />
          </div>
        </div>

        {/* Account Groups */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="w-3.5 h-3.5 text-text-muted" />
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Holdings by Category</h2>
          </div>

          {groupedAccounts.map((group, gi) => {
            const collapsed = collapsedCategories.has(group.category);
            const cfg = group.config;

            return (
              <div key={group.category} className="animate-fade-in-up" style={{ animationDelay: `${180 + gi * 60}ms` }}>
                {/* Group header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="flex items-center justify-between w-full mb-2 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {collapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `var(--color-${cfg.accent})`, opacity: 0.65 }}
                    />
                    <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      {cfg.label}
                    </h3>
                    <span className="text-xs text-text-muted">({group.accounts.length})</span>
                  </div>
                  <span className={`text-sm font-mono font-semibold tabular-nums ${cfg.color}`}>
                    ${fmt(group.total)}
                  </span>
                </button>

                {/* Account rows */}
                {!collapsed && (
                  <div className="space-y-2">
                    {group.accounts.map(acct => {
                      const Icon = TYPE_ICON[acct.investmentType];
                      const gain = acct.balance - acct.costBasis;
                      const gPct = gainPct(acct.balance, acct.costBasis);
                      const isCash = acct.category === 'cash';

                      return (
                        <div
                          key={acct.id}
                          className="group/row flex items-center gap-4 px-4 py-3.5 bg-surface-1 border border-border-dim rounded-lg hover:bg-surface-2/60 hover:border-border-default transition-all duration-200"
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary truncate">{acct.name}</span>
                              <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-medium">
                                {INVESTMENT_TYPE_LABELS[acct.investmentType]}
                              </span>
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">
                              {acct.institution} &middot;&middot;&middot;&middot; {acct.lastFour}
                              <span className="mx-1.5">&middot;</span>
                              Updated {format(new Date(acct.lastUpdated), 'MMM d')}
                            </div>
                          </div>

                          {/* Gain/Loss */}
                          {!isCash && (
                            <div className="hidden sm:block text-right shrink-0">
                              <div className={`text-xs font-mono font-medium tabular-nums ${gain >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                                {gain >= 0 ? '+' : '-'}${fmt(Math.abs(gain))}
                              </div>
                              <div className={`text-[10px] font-mono tabular-nums ${gain >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                                {gain >= 0 ? '+' : ''}{gPct.toFixed(1)}%
                              </div>
                            </div>
                          )}

                          {/* Balance */}
                          <span className="text-sm font-mono font-semibold tabular-nums text-text-primary shrink-0">
                            ${fmt(acct.balance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recurring Contributions */}
        <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
              <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Recurring Contributions</h2>
              <span className="text-xs text-text-muted">({investments.length})</span>
            </div>
          </div>

          {investments.length === 0 ? (
            <div className="bg-surface-1 border border-border-dim rounded-xl p-6 text-center">
              <p className="text-sm text-text-muted">No recurring contributions yet</p>
              <button
                onClick={() => setShowContributionModal(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-violet/10 hover:bg-accent-violet/20 text-accent-violet text-xs font-semibold border border-accent-violet/15 transition-all duration-150 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add your first contribution
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {investments.map(inv => {
                const freqLabel: Record<string, string> = {
                  monthly: 'Monthly',
                  semi_monthly: 'Semi-Monthly',
                  biweekly: 'Biweekly',
                  weekly: 'Weekly',
                  quarterly: 'Quarterly',
                  annual: 'Annual',
                };
                return (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 px-4 py-3.5 bg-surface-1 border border-border-dim rounded-lg hover:bg-surface-2/60 hover:border-border-default transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-accent-violet-dim flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-accent-violet" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary truncate block">{inv.name}</span>
                      <div className="text-xs text-text-muted mt-0.5">
                        {inv.accountName} &middot;&middot;&middot;&middot; {inv.accountLastFour}
                      </div>
                    </div>

                    {/* Frequency + Next Due */}
                    <div className="hidden sm:block text-right shrink-0">
                      <div className="text-xs text-text-secondary font-medium">{freqLabel[inv.frequency] ?? inv.frequency}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        Next: {format(new Date(inv.nextDueDate), 'MMM d')}
                        {inv.daysUntil <= 3 && inv.daysUntil >= 0 && (
                          <span className="ml-1 text-accent-amber font-medium">({inv.daysUntil}d)</span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <span className="text-sm font-mono font-semibold tabular-nums text-text-primary shrink-0">
                      ${fmt(inv.amount)}
                    </span>

                    {/* Contribute button */}
                    <button
                      onClick={() => setMarkContributedInvestment(inv)}
                      className="px-3 py-1.5 rounded-lg bg-accent-mint/10 hover:bg-accent-mint/20 text-accent-mint text-xs font-semibold border border-accent-mint/15 hover:border-accent-mint/25 transition-all duration-150 cursor-pointer shrink-0"
                    >
                      <DollarSign className="w-3.5 h-3.5 inline -mt-0.5" />
                      Contribute
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historical Snapshots */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-text-muted" />
              <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Historical Snapshots</h2>
            </div>
            <span className="text-xs text-text-muted font-mono">{snapshots.length} records</span>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl overflow-x-auto">
            <div className="min-w-[440px]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_80px] sm:grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 border-b border-border-dim bg-surface-2/40">
                {[
                  { key: 'date' as SortField, label: 'Date', hideMobile: false },
                  { key: 'totalValue' as SortField, label: 'Total Value', hideMobile: false },
                  { key: null, label: 'Retirement', hideMobile: false },
                  { key: null, label: 'Taxable', hideMobile: true },
                  { key: 'change' as SortField, label: 'Change', hideMobile: false },
                ].map((col, i) => (
                  <button
                    key={i}
                    onClick={() => col.key && handleSort(col.key)}
                    className={`flex items-center gap-1 text-[11px] font-medium text-text-muted uppercase tracking-wider ${col.key ? 'cursor-pointer hover:text-text-secondary' : 'cursor-default'} ${i >= 3 ? 'justify-end' : ''} ${col.hideMobile ? 'hidden sm:flex' : ''}`}
                  >
                    {col.label}
                    {col.key && sortField === col.key && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>

              {/* Table rows */}
              <div className="divide-y divide-border-dim">
                {sortedSnapshots.slice(0, 8).map((snap, i) => {
                  const prevSnap = snapshots[snapshots.indexOf(snap) + 1];
                  const change = prevSnap ? snap.totalValue - prevSnap.totalValue : 0;
                  const changePctVal = prevSnap ? ((change / prevSnap.totalValue) * 100).toFixed(1) : '0.0';
                  const isPositive = change >= 0;

                  return (
                    <div
                      key={snap.id}
                      className="grid grid-cols-[1fr_1fr_1fr_80px] sm:grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 hover:bg-surface-2/30 transition-colors"
                    >
                      <span className="text-sm text-text-primary">
                        {format(new Date(snap.date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm font-mono font-semibold tabular-nums text-text-primary">
                        ${fmt(snap.totalValue)}
                      </span>
                      <span className="text-sm font-mono tabular-nums text-text-secondary">
                        ${fmt(snap.retirement)}
                      </span>
                      <span className="text-sm font-mono tabular-nums text-text-secondary text-right hidden sm:block">
                        ${fmt(snap.taxable)}
                      </span>
                      <div className="flex items-center justify-end gap-1">
                        {i < sortedSnapshots.length - 1 && prevSnap ? (
                          <>
                            {isPositive ? (
                              <ArrowUpRight className="w-3 h-3 text-accent-mint" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-accent-rose" />
                            )}
                            <span className={`text-sm font-mono tabular-nums ${isPositive ? 'text-accent-mint' : 'text-accent-rose'}`}>
                              {isPositive ? '+' : ''}{changePctVal}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted">&mdash;</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddSnapshotModal
        isOpen={showSnapshotModal}
        onClose={() => setShowSnapshotModal(false)}
        onAdd={handleAddSnapshot}
      />

      <AddContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onAdd={(data) => createInvestmentMutation.mutate(data)}
      />

      <MarkContributedModal
        investment={markContributedInvestment}
        onConfirm={(id, amount) => {
          markContributedMutation.mutate({ id, amount });
          setMarkContributedInvestment(null);
        }}
        onClose={() => setMarkContributedInvestment(null)}
      />
    </div>
  );
}
