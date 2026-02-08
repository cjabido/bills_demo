import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Repeat,
  Target,
  Plus,
  Check,
  Pencil,
} from 'lucide-react';
import {
  MONTH_NAMES,
  type CashFlowPeriod,
  type BudgetCategory,
  type IncomeEntry,
  type ExpenseEntry,
  type TransferEntry,
} from '../data/mockCashFlow';
import { useCurrentPeriod, mapPeriodWithActuals, type ApiPeriodWithActuals } from '../hooks/usePeriods';
import {
  useIncomeSources,
  useCreateIncomeSource,
  useUpdateIncomeSource,
  useMarkIncomeReceived,
  useIncomePayments,
  type IncomePayload,
} from '../hooks/useIncome';
import { useCreateTransaction } from '../hooks/useTransactions';
import type { IncomeSource } from '../data/incomeTypes';
import AddIncomeModal from './AddIncomeModal';
import MarkReceivedModal from './MarkReceivedModal';

// --- Helpers ---

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function shortPeriodLabel(p: CashFlowPeriod) {
  return `${MONTH_NAMES[p.month - 1].slice(0, 3)} ${p.half}`;
}

// --- Budget Variance Bar ---

function VarianceBar({ item }: { item: BudgetCategory }) {
  const pct = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 100;
  const over = item.actual > item.budgeted;
  const barPct = Math.min(pct, 100);
  const overflowPct = over ? Math.min(((item.actual - item.budgeted) / item.budgeted) * 100, 40) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: `var(--color-${item.color})`, opacity: 0.7 }}
          />
          <span className="text-sm text-text-primary">{item.category}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tabular-nums text-text-muted">
            ${fmt(item.budgeted)}
          </span>
          <span className={`text-sm font-mono font-semibold tabular-nums ${over ? 'text-accent-rose' : 'text-text-primary'}`}>
            ${fmt(item.actual)}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden flex">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barPct}%`,
            backgroundColor: `var(--color-${item.color})`,
            opacity: 0.5,
          }}
        />
        {over && (
          <div
            className="h-full rounded-r-full bg-accent-rose transition-all duration-500"
            style={{ width: `${overflowPct}%`, opacity: 0.6 }}
          />
        )}
      </div>
    </div>
  );
}

// --- Period Comparison Mini Chart ---

function PeriodComparison({ current, previous }: { current: CashFlowPeriod; previous: CashFlowPeriod }) {
  const maxVal = Math.max(current.totalIncome, previous.totalIncome, current.totalExpenses, previous.totalExpenses);

  const bars: { label: string; current: number; previous: number; color: string; colorVar: string }[] = [
    { label: 'Income', current: current.totalIncome, previous: previous.totalIncome, color: 'text-accent-mint', colorVar: 'accent-mint' },
    { label: 'Expenses', current: current.totalExpenses, previous: previous.totalExpenses, color: 'text-accent-rose', colorVar: 'accent-rose' },
  ];

  const incomeChange = current.totalIncome - previous.totalIncome;
  const expenseChange = current.totalExpenses - previous.totalExpenses;
  const netCurrent = current.totalIncome - current.totalExpenses - current.totalTransfers;
  const netPrevious = previous.totalIncome - previous.totalExpenses - previous.totalTransfers;

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Period Comparison</h3>
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-text-primary opacity-30" />
            {shortPeriodLabel(previous)}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-text-primary opacity-70" />
            {shortPeriodLabel(current)}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="space-y-4">
        {bars.map(bar => {
          const currentPct = maxVal > 0 ? (bar.current / maxVal) * 100 : 0;
          const previousPct = maxVal > 0 ? (bar.previous / maxVal) * 100 : 0;

          return (
            <div key={bar.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${bar.color}`}>{bar.label}</span>
              </div>
              <div className="space-y-1">
                {/* Previous */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${previousPct}%`, backgroundColor: `var(--color-${bar.colorVar})`, opacity: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-text-muted w-16 text-right">${fmt(bar.previous)}</span>
                </div>
                {/* Current */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentPct}%`, backgroundColor: `var(--color-${bar.colorVar})`, opacity: 0.7 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-text-primary font-medium w-16 text-right">${fmt(bar.current)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Change summary */}
      <div className="mt-4 pt-3 border-t border-border-dim grid grid-cols-3 gap-3">
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Income</span>
          <span className={`text-xs font-mono font-medium tabular-nums ${incomeChange >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
            {incomeChange >= 0 ? '+' : '-'}${fmt(Math.abs(incomeChange))}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Expenses</span>
          <span className={`text-xs font-mono font-medium tabular-nums ${expenseChange <= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
            {expenseChange >= 0 ? '+' : '-'}${fmt(Math.abs(expenseChange))}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Net</span>
          <span className={`text-xs font-mono font-semibold tabular-nums ${netCurrent >= netPrevious ? 'text-accent-mint' : 'text-accent-rose'}`}>
            {netCurrent >= 0 ? '+' : '-'}${fmt(Math.abs(netCurrent))}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

// Helper to derive entries from the raw period data
function deriveEntries(periodData: ApiPeriodWithActuals | undefined) {
  if (!periodData || !periodData.transactions) {
    return { incomeEntries: [] as IncomeEntry[], expenseEntries: [] as ExpenseEntry[], transferEntries: [] as TransferEntry[], budgetCategories: [] as BudgetCategory[] };
  }

  const incomeEntries: IncomeEntry[] = [];
  const expenseEntries: ExpenseEntry[] = [];
  const transferEntries: TransferEntry[] = [];

  for (const tx of periodData.transactions) {
    const amount = Number(tx.amount);
    const date = typeof tx.date === 'string' ? tx.date.slice(0, 10) : tx.date;

    if (tx.category.name === 'Transfer') {
      transferEntries.push({
        id: tx.id,
        description: tx.description,
        amount: Math.abs(amount),
        date,
        fromAccount: amount < 0 ? tx.account.name : '',
        toAccount: amount > 0 ? tx.account.name : '',
      });
    } else if (amount > 0) {
      incomeEntries.push({
        id: tx.id,
        source: tx.description,
        amount,
        date,
        accountName: tx.account.name,
        accountLastFour: tx.account.lastFour,
        isProjected: false,
      });
    } else {
      // Find matching budget
      const budget = periodData.budgets.find(b => b.categoryId === tx.category.id);
      expenseEntries.push({
        id: tx.id,
        category: tx.category.name,
        description: tx.description,
        amount: Math.abs(amount),
        date,
        accountName: tx.account.name,
        budgeted: budget ? Number(budget.budgetedAmount) : 0,
      });
    }
  }

  // Build budget categories from budgets + actual spending
  const categoryActuals = new Map<string, number>();
  for (const exp of expenseEntries) {
    categoryActuals.set(exp.category, (categoryActuals.get(exp.category) ?? 0) + exp.amount);
  }

  const budgetCategories: BudgetCategory[] = periodData.budgets.map(b => ({
    category: b.category.name,
    budgeted: Number(b.budgetedAmount),
    actual: categoryActuals.get(b.category.name) ?? 0,
    color: b.category.color,
  }));

  // Add categories that have spending but no budget
  for (const [cat, actual] of categoryActuals) {
    if (!budgetCategories.some(b => b.category === cat)) {
      budgetCategories.push({ category: cat, budgeted: 0, actual, color: 'accent-sky' });
    }
  }

  return { incomeEntries, expenseEntries, transferEntries, budgetCategories };
}

export default function CashFlowPage() {
  const { data: periodData, isLoading, isError } = useCurrentPeriod();
  const { data: incomeSources = [] } = useIncomeSources();
  const createIncomeMutation = useCreateIncomeSource();
  const updateIncomeMutation = useUpdateIncomeSource();
  const markReceivedMutation = useMarkIncomeReceived();
  const createTransactionMutation = useCreateTransaction();

  const currentPeriod: CashFlowPeriod = periodData
    ? mapPeriodWithActuals(periodData)
    : { year: new Date().getFullYear(), month: new Date().getMonth() + 1, half: '2H', startingBalance: 0, endingBalance: 0, projectedEndingBalance: 0, totalIncome: 0, projectedIncome: 0, totalExpenses: 0, projectedExpenses: 0, totalTransfers: 0 };

  // For period comparison, we use the same period as "previous" since we only fetch current
  const previousPeriod = currentPeriod;

  const { incomeEntries, expenseEntries, transferEntries, budgetCategories } = useMemo(
    () => deriveEntries(periodData),
    [periodData]
  );

  // Income grouped by account
  const incomeByAccount = useMemo(() => {
    const map = new Map<string, IncomeEntry[]>();
    for (const entry of incomeEntries) {
      const key = entry.accountName;
      const existing = map.get(key);
      if (existing) existing.push(entry);
      else map.set(key, [entry]);
    }
    return Array.from(map.entries());
  }, [incomeEntries]);

  // Expenses grouped by category
  const expensesByCategory = useMemo(() => {
    const map = new Map<string, ExpenseEntry[]>();
    for (const entry of expenseEntries) {
      const key = entry.category;
      const existing = map.get(key);
      if (existing) existing.push(entry);
      else map.set(key, [entry]);
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const totalA = a.reduce((s, e) => s + e.amount, 0);
      const totalB = b.reduce((s, e) => s + e.amount, 0);
      return totalB - totalA;
    });
  }, [expenseEntries]);

  const netFlow = currentPeriod.totalIncome - currentPeriod.totalExpenses - currentPeriod.totalTransfers;

  // Income source management
  const periodRange = useMemo(() => {
    if (!periodData) return { from: '', to: '' };
    const half = periodData.half;
    const y = periodData.year;
    const m = periodData.month;
    if (half === 1) {
      return { from: `${y}-${String(m).padStart(2, '0')}-01`, to: `${y}-${String(m).padStart(2, '0')}-15` };
    }
    const lastDay = new Date(y, m, 0).getDate();
    return { from: `${y}-${String(m).padStart(2, '0')}-16`, to: `${y}-${String(m).padStart(2, '0')}-${lastDay}` };
  }, [periodData]);

  // Fetch received income payments for the period (used to avoid double-showing)
  useIncomePayments(periodRange.from, periodRange.to);

  const expectedIncome = useMemo(() => {
    if (!periodData) return [] as IncomeSource[];
    const half = periodData.half;
    const y = periodData.year;
    const m = periodData.month - 1;
    const rangeStart = half === 1 ? 1 : 16;
    const rangeEnd = half === 1 ? 15 : new Date(y, m + 1, 0).getDate();

    return incomeSources.filter((s: IncomeSource) => {
      const d = new Date(s.expectedDate + 'T00:00:00');
      return d.getFullYear() === y && d.getMonth() === m && d.getDate() >= rangeStart && d.getDate() <= rangeEnd;
    });
  }, [incomeSources, periodData]);

  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [editIncomeSource, setEditIncomeSource] = useState<IncomeSource | null>(null);
  const [markReceivedSource, setMarkReceivedSource] = useState<IncomeSource | null>(null);

  const handleAddRecurring = (data: IncomePayload) => {
    createIncomeMutation.mutate(data);
  };

  const handleAddOneOff = (data: {
    description: string;
    merchant: string;
    amount: number;
    date: string;
    categoryId: string;
    accountId: string;
    notes?: string;
  }) => {
    createTransactionMutation.mutate(data);
  };

  const handleEditIncome = (id: string, data: IncomePayload) => {
    updateIncomeMutation.mutate({ id, ...data });
  };

  const confirmMarkReceived = (id: string, amount: number) => {
    markReceivedMutation.mutate({ id, amount });
    setMarkReceivedSource(null);
  };

  // Export handler
  const handleExport = () => {
    const rows = [
      ['Type', 'Description', 'Amount', 'Date', 'Account'],
      ...incomeEntries.map(e => ['Income', e.source, e.amount.toString(), e.date, e.accountName]),
      ...expenseEntries.map(e => ['Expense', e.description, (-e.amount).toString(), e.date, e.accountName]),
      ...transferEntries.map(e => ['Transfer', e.description, e.amount.toString(), e.date, `${e.fromAccount} → ${e.toAccount}`]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-${currentPeriod.year}-${String(currentPeriod.month).padStart(2, '0')}-${currentPeriod.half}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load data.</p></div>;

  return (
    <div className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-sky-dim flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-accent-sky" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Cash Flow</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Period display */}
              <div className="flex items-center gap-1 px-1 py-1 bg-surface-1 border border-border-dim rounded-lg">
                <div className="px-3 py-1 min-w-[110px] sm:min-w-[160px] text-center">
                  <span className="text-sm font-medium text-text-primary">
                    {MONTH_NAMES[currentPeriod.month - 1]} {currentPeriod.year}
                  </span>
                  <span className="text-xs text-accent-sky ml-2 font-mono">{currentPeriod.half}</span>
                </div>
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-sky/10 hover:bg-accent-sky/20 text-accent-sky text-xs font-semibold border border-accent-sky/15 hover:border-accent-sky/25 transition-all duration-150 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Starting</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-2">
                <Wallet className="w-3.5 h-3.5 text-text-secondary" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-text-primary">
              ${fmt(currentPeriod.startingBalance)}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {currentPeriod.half === '1H' ? 'Jan 1' : 'Jan 16'} balance
            </div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Income</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim">
                <TrendingUp className="w-3.5 h-3.5 text-accent-mint" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-mint">
              +${fmt(currentPeriod.totalIncome)}
            </div>
            {currentPeriod.totalIncome !== currentPeriod.projectedIncome && (
              <div className="text-xs text-text-muted mt-1">
                Projected: ${fmt(currentPeriod.projectedIncome)}
              </div>
            )}
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Expenses</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-rose-dim">
                <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-rose">
              -${fmt(currentPeriod.totalExpenses)}
            </div>
            {currentPeriod.totalExpenses !== currentPeriod.projectedExpenses && (
              <div className="flex items-center gap-1 mt-1">
                {currentPeriod.totalExpenses < currentPeriod.projectedExpenses ? (
                  <ArrowDownRight className="w-3 h-3 text-accent-mint" />
                ) : (
                  <ArrowUpRight className="w-3 h-3 text-accent-rose" />
                )}
                <span className="text-xs text-text-muted">
                  vs ${fmt(currentPeriod.projectedExpenses)} projected
                </span>
              </div>
            )}
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Ending</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${netFlow >= 0 ? 'bg-accent-mint-dim' : 'bg-accent-rose-dim'}`}>
                <DollarSign className={`w-3.5 h-3.5 ${netFlow >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`} />
              </div>
            </div>
            <div className={`text-lg sm:text-2xl font-mono font-semibold tabular-nums ${netFlow >= 0 ? 'text-text-primary' : 'text-accent-rose'}`}>
              ${fmt(currentPeriod.endingBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {netFlow >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-accent-mint" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-accent-rose" />
              )}
              <span className={`text-xs font-medium ${netFlow >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                {netFlow >= 0 ? '+' : '-'}${fmt(Math.abs(netFlow))} net
              </span>
            </div>
          </div>
        </div>

        {/* Actual vs Projected banner */}
        <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-6">
              <div>
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Actual Ending</span>
                <span className="text-base sm:text-lg font-mono font-semibold tabular-nums text-text-primary">${fmt(currentPeriod.endingBalance)}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted" />
              <div>
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Projected Ending</span>
                <span className="text-base sm:text-lg font-mono font-semibold tabular-nums text-text-secondary">${fmt(currentPeriod.projectedEndingBalance)}</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Variance</span>
              {(() => {
                const variance = currentPeriod.endingBalance - currentPeriod.projectedEndingBalance;
                const positive = variance >= 0;
                return (
                  <span className={`text-lg font-mono font-semibold tabular-nums ${positive ? 'text-accent-mint' : 'text-accent-rose'}`}>
                    {positive ? '+' : '-'}${fmt(Math.abs(variance))}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left column */}
          <div className="space-y-6">

            {/* Income Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '260ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-accent-mint" />
                <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Income</h2>
                <span className="text-xs font-mono font-semibold tabular-nums text-accent-mint ml-auto mr-2">
                  +${fmt(currentPeriod.totalIncome)}
                </span>
                <button
                  onClick={() => { setEditIncomeSource(null); setShowAddIncomeModal(true); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-mint/10 hover:bg-accent-mint/20 text-accent-mint text-xs font-semibold border border-accent-mint/15 hover:border-accent-mint/25 transition-all duration-150 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              {/* Expected (upcoming) income */}
              {expectedIncome.length > 0 && (
                <div className="bg-surface-1 border border-accent-mint/20 border-dashed rounded-xl overflow-hidden mb-3">
                  <div className="px-4 py-2 bg-accent-mint/5">
                    <span className="text-[10px] font-medium text-accent-mint uppercase tracking-wider">Expected This Period</span>
                  </div>
                  <div className="divide-y divide-border-dim">
                    {expectedIncome.map((source: IncomeSource) => (
                      <div key={source.id} className="group flex items-center justify-between px-4 py-3 hover:bg-surface-2/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-mint-dim shrink-0">
                            <ArrowUpRight className="w-4 h-4 text-accent-mint" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{source.name}</div>
                            <div className="text-xs text-text-muted">
                              {format(new Date(source.expectedDate), 'MMM d')}
                              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-accent-amber-dim text-accent-amber font-medium">Expected</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold tabular-nums text-accent-mint shrink-0">
                            +${fmt(source.amount)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                            <button
                              onClick={() => { setEditIncomeSource(source); setShowAddIncomeModal(true); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text-secondary transition-all duration-150 cursor-pointer"
                              title="Edit income source"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setMarkReceivedSource(source)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim hover:bg-accent-mint/20 text-accent-mint transition-all duration-150 cursor-pointer"
                              title="Mark as received"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface-1 border border-border-dim rounded-xl overflow-hidden">
                {incomeByAccount.map(([accountName, entries], gi) => (
                  <div key={accountName}>
                    {gi > 0 && <div className="border-t border-border-dim" />}
                    <div className="px-4 py-2 bg-surface-2/30">
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{accountName}</span>
                    </div>
                    <div className="divide-y divide-border-dim">
                      {entries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-2/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-mint-dim shrink-0">
                              <ArrowUpRight className="w-4 h-4 text-accent-mint" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-text-primary truncate">{entry.source}</div>
                              <div className="text-xs text-text-muted">
                                {format(new Date(entry.date), 'MMM d')}
                                {entry.isProjected && (
                                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-accent-amber-dim text-accent-amber font-medium">Projected</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-mono font-semibold tabular-nums text-accent-mint shrink-0">
                            +${fmt(entry.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '320ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />
                <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Expenses by Category</h2>
                <span className="text-xs font-mono font-semibold tabular-nums text-accent-rose ml-auto">
                  -${fmt(currentPeriod.totalExpenses)}
                </span>
              </div>

              <div className="bg-surface-1 border border-border-dim rounded-xl overflow-hidden">
                {expensesByCategory.map(([category, entries], gi) => {
                  const total = entries.reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={category}>
                      {gi > 0 && <div className="border-t border-border-dim" />}
                      <div className="px-4 py-2 bg-surface-2/30 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{category}</span>
                        <span className="text-[10px] font-mono font-medium text-text-muted tabular-nums">${fmt(total)}</span>
                      </div>
                      <div className="divide-y divide-border-dim">
                        {entries.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-2/30 transition-colors">
                            <div className="min-w-0">
                              <div className="text-sm text-text-primary truncate">{entry.description}</div>
                              <div className="text-xs text-text-muted">
                                {format(new Date(entry.date), 'MMM d')}
                                <span className="mx-1.5">&middot;</span>
                                {entry.accountName}
                              </div>
                            </div>
                            <span className="text-sm font-mono font-semibold tabular-nums text-text-primary shrink-0">
                              -${fmt(entry.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transfers Section */}
            {transferEntries.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '380ms' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Repeat className="w-3.5 h-3.5 text-accent-sky" />
                  <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Transfers & Savings</h2>
                  <span className="text-xs font-mono font-semibold tabular-nums text-accent-sky ml-auto">
                    ${fmt(currentPeriod.totalTransfers)}
                  </span>
                </div>

                <div className="bg-surface-1 border border-border-dim rounded-xl divide-y divide-border-dim">
                  {transferEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-2/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-sky-dim shrink-0">
                          <Repeat className="w-4 h-4 text-accent-sky" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{entry.description}</div>
                          <div className="text-xs text-text-muted">
                            {format(new Date(entry.date), 'MMM d')}
                            <span className="mx-1.5">&middot;</span>
                            {entry.fromAccount}
                            <span className="mx-1"> → </span>
                            {entry.toAccount}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-semibold tabular-nums text-accent-sky shrink-0">
                        ${fmt(entry.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-4">
            {/* Period Comparison */}
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <PeriodComparison current={currentPeriod} previous={previousPeriod} />
            </div>

            {/* Budget Variance */}
            <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-3.5 h-3.5 text-text-muted" />
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Budget vs Actual</h3>
              </div>

              <div className="space-y-3">
                {budgetCategories.map(item => (
                  <VarianceBar key={item.category} item={item} />
                ))}
              </div>

              {/* Budget totals */}
              <div className="mt-4 pt-3 border-t border-border-dim flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Total</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono tabular-nums text-text-muted">
                    ${fmt(budgetCategories.reduce((s, c) => s + c.budgeted, 0))}
                  </span>
                  {(() => {
                    const totalBudgeted = budgetCategories.reduce((s, c) => s + c.budgeted, 0);
                    const totalActual = budgetCategories.reduce((s, c) => s + c.actual, 0);
                    const over = totalActual > totalBudgeted;
                    return (
                      <span className={`text-sm font-mono font-semibold tabular-nums ${over ? 'text-accent-rose' : 'text-text-primary'}`}>
                        ${fmt(totalActual)}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Add / Edit Income Modal */}
      <AddIncomeModal
        isOpen={showAddIncomeModal}
        onClose={() => { setShowAddIncomeModal(false); setEditIncomeSource(null); }}
        onAddRecurring={handleAddRecurring}
        onAddOneOff={handleAddOneOff}
        editSource={editIncomeSource}
        onEdit={handleEditIncome}
      />

      {/* Mark Received Modal */}
      <MarkReceivedModal
        source={markReceivedSource}
        onConfirm={confirmMarkReceived}
        onClose={() => setMarkReceivedSource(null)}
      />
    </div>
  );
}
