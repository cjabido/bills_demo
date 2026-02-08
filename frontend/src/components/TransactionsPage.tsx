import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeftRight,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Activity,
  // Tag,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  TX_CATEGORY_CONFIG,
  type TxRecord,
  type TxCategory,
} from '../data/mockTransactions';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { getIconComponent } from '../lib/categoryIcons';

type FlowFilter = 'all' | 'income' | 'expense';

// --- Transaction Detail Panel ---
interface DetailPanelProps {
  tx: TxRecord;
  onClose: () => void;
  onUpdateCategory: (id: string, category: TxCategory) => void;
  iconMap: Record<string, string>;
}

function DetailPanel({ tx, onClose, onUpdateCategory }: DetailPanelProps) {
  const isIncome = tx.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-surface-1 border border-border-default rounded-2xl shadow-2xl shadow-black/10 animate-fade-in-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-dim">
          <h2 className="text-sm font-semibold text-text-primary">Transaction Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Amount */}
          <div className="text-center">
            <div className={`text-3xl font-mono font-bold tabular-nums ${isIncome ? 'text-accent-mint' : 'text-text-primary'}`}>
              {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-text-muted mt-1">{format(new Date(tx.date), 'EEEE, MMMM d, yyyy')}</div>
          </div>

          {/* Info rows */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider">Merchant</span>
              <span className="text-sm text-text-primary font-medium">{tx.merchant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider">Description</span>
              <span className="text-sm text-text-secondary">{tx.description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider">Account</span>
              <span className="text-sm text-text-secondary">{tx.accountName} &middot;&middot;&middot;&middot; {tx.accountLastFour}</span>
            </div>

            {/* Category selector */}
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-2">Category</span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(TX_CATEGORY_CONFIG) as TxCategory[]).map((c) => {
                  const cfg = TX_CATEGORY_CONFIG[c];
                  const selected = tx.category === c;
                  return (
                    <button
                      key={c}
                      onClick={() => onUpdateCategory(tx.id, c)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer
                        ${selected
                          ? `${cfg.bg} ${cfg.color} ring-1 ring-current/20`
                          : 'bg-surface-2 text-text-muted hover:text-text-secondary hover:bg-surface-3'
                        }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function TransactionsPage() {
  const { data: txResult, isLoading, isError } = useTransactions({ pageSize: 100 });
  const { data: categories } = useCategories();
  const transactions: TxRecord[] = txResult?.data ?? [];

  // Build icon lookup from live category data: category key -> icon name
  const iconMap = useMemo(() => {
    if (!categories) return {} as Record<string, string>;
    return categories.reduce<Record<string, string>>((acc, c) => {
      const key = c.name.toLowerCase().replace(/\s+/g, '_');
      acc[key] = c.icon;
      return acc;
    }, {});
  }, [categories]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [flowFilter, setFlowFilter] = useState<FlowFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<TxCategory | 'all'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TxRecord | null>(null);

  const handleUpdateCategory = (id: string, category: TxCategory) => {
    // Optimistically update the selected tx for the detail panel
    setSelectedTx(prev => prev && prev.id === id ? { ...prev, category } : prev);
  };

  const filtered = useMemo(() => {
    let result = transactions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx =>
        tx.description.toLowerCase().includes(q) ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.accountName.toLowerCase().includes(q)
      );
    }

    if (flowFilter === 'income') result = result.filter(tx => tx.amount > 0);
    else if (flowFilter === 'expense') result = result.filter(tx => tx.amount < 0);

    if (categoryFilter !== 'all') result = result.filter(tx => tx.category === categoryFilter);

    return result;
  }, [transactions, searchQuery, flowFilter, categoryFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TxRecord[]>();
    for (const tx of filtered) {
      const existing = map.get(tx.date);
      if (existing) existing.push(tx);
      else map.set(tx.date, [tx]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const totalIncome = useMemo(() => filtered.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const totalExpenses = useMemo(() => filtered.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0), [filtered]);
  const net = totalIncome - totalExpenses;

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load data.</p></div>;

  const flowButtons: { key: FlowFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expenses' },
  ];

  return (
    <div className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-amber-dim flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4 text-accent-amber" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Transactions</h1>
              <span className="text-xs text-text-muted font-mono">{filtered.length}</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-sky/10 hover:bg-accent-sky/20 text-accent-sky text-xs font-semibold border border-accent-sky/15 hover:border-accent-sky/25 transition-all duration-150 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Income</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim">
                <TrendingUp className="w-3.5 h-3.5 text-accent-mint" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-mint">
              +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Expenses</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-rose-dim">
                <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-rose">
              -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Net</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${net >= 0 ? 'bg-accent-mint-dim' : 'bg-accent-rose-dim'}`}>
                <Activity className={`w-3.5 h-3.5 ${net >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`} />
              </div>
            </div>
            <div className={`text-lg sm:text-2xl font-mono font-semibold tabular-nums ${net >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
              {net >= 0 ? '+' : '-'}${Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Flow filter pills */}
            <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border-dim rounded-lg">
              {flowButtons.map(fb => (
                <button
                  key={fb.key}
                  onClick={() => setFlowFilter(fb.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer
                    ${flowFilter === fb.key
                      ? 'bg-surface-3 text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-secondary'
                    }`}
                >
                  {fb.label}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer border
                  ${categoryFilter !== 'all'
                    ? `${TX_CATEGORY_CONFIG[categoryFilter].bg} ${TX_CATEGORY_CONFIG[categoryFilter].color} border-current/10`
                    : 'bg-surface-1 border-border-dim text-text-muted hover:text-text-secondary'
                  }`}
              >
                Category
                <ChevronDown className="w-3 h-3" />
              </button>
              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 w-44 bg-surface-1 border border-border-default rounded-lg shadow-lg shadow-black/10 py-1 animate-fade-in-up">
                    <button
                      onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors
                        ${categoryFilter === 'all' ? 'text-text-primary bg-surface-2 font-medium' : 'text-text-secondary hover:bg-surface-2'}`}
                    >
                      All Categories
                    </button>
                    {(Object.keys(TX_CATEGORY_CONFIG) as TxCategory[]).map(c => {
                      const cfg = TX_CATEGORY_CONFIG[c];
                      return (
                        <button
                          key={c}
                          onClick={() => { setCategoryFilter(c); setShowCategoryDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors
                            ${categoryFilter === c ? `${cfg.color} bg-surface-2 font-medium` : 'text-text-secondary hover:bg-surface-2'}`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            {showSearch ? (
              <div className="relative animate-fade-in-up">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                  placeholder="Search transactions..."
                  autoFocus
                  className="w-52 pl-9 pr-3 py-2 rounded-lg bg-surface-1 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/40 transition-colors"
                />
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Transaction list grouped by date */}
        <div className="space-y-4">
          {grouped.map(([date, txs], gi) => {
            const dayTotal = txs.reduce((s, tx) => s + tx.amount, 0);
            return (
              <div key={date} className="animate-fade-in-up" style={{ animationDelay: `${180 + gi * 40}ms` }}>
                {/* Date header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </span>
                  <span className={`text-xs font-mono font-medium tabular-nums ${dayTotal >= 0 ? 'text-accent-mint' : 'text-text-muted'}`}>
                    {dayTotal >= 0 ? '+' : '-'}${Math.abs(dayTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Rows */}
                <div className="bg-surface-1 border border-border-dim rounded-xl overflow-hidden divide-y divide-border-dim">
                  {txs.map((tx) => {
                    const cat = TX_CATEGORY_CONFIG[tx.category];
                    const Icon = getIconComponent(iconMap[tx.category] ?? 'Tag');
                    const isIncome = tx.amount > 0;

                    return (
                      <button
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2/50 transition-colors cursor-pointer text-left"
                      >
                        {/* Category icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.bg}`}>
                          <Icon className={`w-4 h-4 ${cat.color}`} />
                        </div>

                        {/* Description + meta */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{tx.description}</div>
                          <div className="text-xs text-text-muted mt-0.5 truncate">
                            <span className={`${cat.color}`}>{cat.label}</span>
                            <span className="mx-1.5">&middot;</span>
                            {tx.accountName} &middot;&middot;&middot;&middot; {tx.accountLastFour}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="shrink-0 flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-mono font-semibold tabular-nums ${isIncome ? 'text-accent-mint' : 'text-text-primary'}`}>
                            {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-accent-mint hidden sm:block" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {grouped.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">No transactions match your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail panel */}
      {selectedTx && (
        <DetailPanel
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          onUpdateCategory={handleUpdateCategory}
          iconMap={iconMap}
        />
      )}
    </div>
  );
}
