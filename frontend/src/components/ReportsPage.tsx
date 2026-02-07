import { useState, useMemo } from 'react';
import {
  PieChart,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  Store,
} from 'lucide-react';
import {
  REPORT_TYPE_OPTIONS,
  DATE_RANGE_OPTIONS,
  type ReportType,
  type DateRange,
  type MonthlySummary,
  type CategorySpending,
  type NetWorthPoint,
} from '../data/mockReports';
import { useMonthlySummary, useCategorySpending, useTopMerchants, useNetWorthHistory } from '../hooks/useReports';

// --- Helpers ---

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function fmtCompact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function filterByRange(data: MonthlySummary[], range: DateRange): MonthlySummary[] {
  switch (range) {
    case 'this_month': return data.slice(-1);
    case 'last_3': return data.slice(-3);
    case 'last_6': return data.slice(-6);
    case 'this_year':
    default: return data;
  }
}

function filterNWByRange(data: NetWorthPoint[], range: DateRange): NetWorthPoint[] {
  switch (range) {
    case 'this_month': return data.slice(-1);
    case 'last_3': return data.slice(-3);
    case 'last_6': return data.slice(-6);
    case 'this_year':
    default: return data;
  }
}

// --- Income vs Expenses Grouped Bar Chart ---

function TrendChart({ data }: { data: MonthlySummary[] }) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]));
  const width = 720;
  const height = 220;
  const padX = 48;
  const padTop = 16;
  const padBot = 32;
  const usableW = width - padX * 2;
  const usableH = height - padTop - padBot;

  const barGroupWidth = usableW / data.length;
  const barWidth = Math.min(barGroupWidth * 0.3, 28);
  const gap = 3;

  // Y-axis grid lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const val = (maxVal * i) / gridCount;
    const y = padTop + usableH - (i / gridCount) * usableH;
    return { val, y };
  });

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Income vs Expenses</h3>
        <div className="flex items-center gap-4 text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-accent-mint)', opacity: 0.6 }} />
            Income
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-accent-rose)', opacity: 0.6 }} />
            Expenses
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 220 }} preserveAspectRatio="none">
        {/* Grid */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={padX} y1={gl.y} x2={width - padX} y2={gl.y}
              stroke="var(--color-border-dim)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text
              x={padX - 8} y={gl.y + 3}
              textAnchor="end" fill="var(--color-text-muted)" fontSize="9" fontFamily="var(--font-mono)"
            >
              {fmtCompact(gl.val)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const cx = padX + barGroupWidth * i + barGroupWidth / 2;
          const incomeH = maxVal > 0 ? (d.income / maxVal) * usableH : 0;
          const expenseH = maxVal > 0 ? (d.expenses / maxVal) * usableH : 0;

          return (
            <g key={d.month}>
              {/* Income bar */}
              <rect
                x={cx - barWidth - gap / 2}
                y={padTop + usableH - incomeH}
                width={barWidth}
                height={incomeH}
                rx={3}
                fill="var(--color-accent-mint)"
                opacity="0.55"
              />
              {/* Expense bar */}
              <rect
                x={cx + gap / 2}
                y={padTop + usableH - expenseH}
                width={barWidth}
                height={expenseH}
                rx={3}
                fill="var(--color-accent-rose)"
                opacity="0.55"
              />
              {/* X label */}
              <text
                x={cx} y={height - 8}
                textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="var(--font-sans)"
              >
                {d.label.split(' ')[0].slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Spending Ring Chart ---

function SpendingRing({ categories }: { categories: CategorySpending[] }) {
  const total = categories.reduce((s, c) => s + c.amount, 0);
  const sorted = [...categories].sort((a, b) => b.amount - a.amount);

  // Ring geometry
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 60;
  const strokeWidth = 20;

  let currentAngle = -90; // start from top

  const segments = sorted.map(cat => {
    const angle = (cat.amount / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    return { ...cat, path };
  });

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Spending by Category</h3>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Ring */}
        <div className="shrink-0 self-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg, i) => (
              <path
                key={i}
                d={seg.path}
                fill="none"
                stroke={`var(--color-${seg.color})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity="0.6"
              />
            ))}
            {/* Center text */}
            <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontFamily="var(--font-sans)">
              Total
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--color-text-primary)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="600">
              {fmtCompact(total)}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 w-full">
          {sorted.slice(0, 8).map(cat => (
            <div key={cat.category} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: `var(--color-${cat.color})`, opacity: 0.6 }}
                />
                <span className="text-sm text-text-secondary truncate">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-text-muted tabular-nums font-mono">{cat.percentage.toFixed(1)}%</span>
                <span className="text-sm font-mono font-semibold tabular-nums text-text-primary w-20 text-right">
                  ${fmt(cat.amount)}
                </span>
              </div>
            </div>
          ))}
          {sorted.length > 8 && (
            <div className="text-xs text-text-muted pt-1">
              +{sorted.length - 8} more categories
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Net Worth Area Chart ---

function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  if (data.length < 2) return null;

  const values = data.map(d => d.netWorth);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.02;
  const range = max - min || 1;

  const width = 720;
  const height = 200;
  const padX = 48;
  const padTop = 16;
  const padBot = 28;
  const usableW = width - padX * 2;
  const usableH = height - padTop - padBot;

  const pts = data.map((d, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * usableW,
    y: padTop + usableH - ((d.netWorth - min) / range) * usableH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${height - padBot} L ${pts[0].x},${height - padBot} Z`;

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const changePct = ((change / first) * 100).toFixed(1);
  const isPositive = change >= 0;

  // Grid lines
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    const y = padTop + usableH - (i / 4) * usableH;
    return { val, y };
  });

  return (
    <div className="bg-surface-1 border border-border-dim rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Net Worth Growth</h3>
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
        <div className="text-right">
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block">Current</span>
          <span className="text-lg font-mono font-semibold tabular-nums text-text-primary">${fmtCompact(last)}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={padX} y1={gl.y} x2={width - padX} y2={gl.y}
              stroke="var(--color-border-dim)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text
              x={padX - 8} y={gl.y + 3}
              textAnchor="end" fill="var(--color-text-muted)" fontSize="9" fontFamily="var(--font-mono)"
            >
              {fmtCompact(gl.val)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#nwFill)" />
        <path
          d={linePath} fill="none"
          stroke={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* End dot */}
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4"
          fill={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'} />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="8"
          fill={isPositive ? 'var(--color-accent-mint)' : 'var(--color-accent-rose)'} opacity="0.15" />

        {/* X labels */}
        {pts.map((p, i) => {
          const step = data.length <= 6 ? 1 : data.length <= 8 ? 2 : 3;
          if (i % step !== 0 && i !== pts.length - 1) return null;
          return (
            <text key={i} x={p.x} y={height - 8}
              textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="var(--font-sans)">
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// --- Main Page ---

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('this_year');

  const { data: monthlySummaries = [], isLoading: summariesLoading, isError: summariesError } = useMonthlySummary(12);
  const { data: categorySpending = [], isLoading: spendingLoading } = useCategorySpending();
  const { data: topMerchants = [], isLoading: merchantsLoading } = useTopMerchants(12);
  const { data: netWorthHistory = [], isLoading: netWorthLoading } = useNetWorthHistory(12);

  const isLoading = summariesLoading || spendingLoading || merchantsLoading || netWorthLoading;
  const isError = summariesError;

  const filteredSummaries = useMemo(() => filterByRange(monthlySummaries, dateRange), [monthlySummaries, dateRange]);
  const filteredNetWorth = useMemo(() => filterNWByRange(netWorthHistory, dateRange), [netWorthHistory, dateRange]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    if (filteredSummaries.length === 0) return { avgIncome: 0, avgExpenses: 0, savingsRate: 0, totalSaved: 0 };
    const totalIncome = filteredSummaries.reduce((s, m) => s + m.income, 0);
    const totalExpenses = filteredSummaries.reduce((s, m) => s + m.expenses, 0);
    const avgIncome = totalIncome / filteredSummaries.length;
    const avgExpenses = totalExpenses / filteredSummaries.length;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const totalSaved = totalIncome - totalExpenses;
    return { avgIncome, avgExpenses, savingsRate, totalSaved };
  }, [filteredSummaries]);

  // Export CSV
  const handleExport = () => {
    const rows = [
      ['Month', 'Income', 'Expenses', 'Net', 'Savings Rate (%)'],
      ...filteredSummaries.map(m => [m.label, m.income.toString(), m.expenses.toString(), m.net.toString(), m.savingsRate.toString()]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Which sections to show based on report type
  const showOverview = reportType === 'overview';
  const showSpending = reportType === 'overview' || reportType === 'spending' || reportType === 'budget';
  const showIncome = reportType === 'overview' || reportType === 'income';
  const showNetWorth = reportType === 'overview' || reportType === 'networth';
  const showMerchants = reportType === 'overview' || reportType === 'spending';
  const showTable = true;

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load data.</p></div>;

  return (
    <div className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-violet-dim flex items-center justify-center">
                <PieChart className="w-4 h-4 text-accent-violet" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Reports</h1>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-sky/10 hover:bg-accent-sky/20 text-accent-sky text-xs font-semibold border border-accent-sky/15 hover:border-accent-sky/25 transition-all duration-150 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in-up">
          {/* Report type pills */}
          <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border-dim rounded-lg overflow-x-auto max-w-full">
            {REPORT_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setReportType(opt.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer
                  ${reportType === opt.key
                    ? 'bg-surface-3 text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Date range pills */}
          <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border-dim rounded-lg">
            {DATE_RANGE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer
                  ${dateRange === opt.key
                    ? 'bg-surface-3 text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Avg Income</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim">
                <TrendingUp className="w-3.5 h-3.5 text-accent-mint" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-mint">
              ${fmt(metrics.avgIncome)}
            </div>
            <div className="text-xs text-text-muted mt-1">per month</div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Avg Expenses</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-rose-dim">
                <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-rose">
              ${fmt(metrics.avgExpenses)}
            </div>
            <div className="text-xs text-text-muted mt-1">per month</div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Savings Rate</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-sky-dim">
                <Percent className="w-3.5 h-3.5 text-accent-sky" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-sky">
              {metrics.savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-text-muted mt-1">of income saved</div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Saved</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim">
                <DollarSign className="w-3.5 h-3.5 text-accent-mint" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-mint">
              +${fmt(metrics.totalSaved)}
            </div>
            <div className="text-xs text-text-muted mt-1">over period</div>
          </div>
        </div>

        {/* Charts row */}
        {(showIncome || showOverview) && filteredSummaries.length >= 2 && (
          <div className={`animate-fade-in-up ${showSpending ? 'grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4' : ''}`} style={{ animationDelay: '300ms' }}>
            <TrendChart data={filteredSummaries} />
            {showSpending && <SpendingRing categories={categorySpending} />}
          </div>
        )}

        {/* Spending only (if not shown above) */}
        {showSpending && !showIncome && !showOverview && (
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <SpendingRing categories={categorySpending} />
          </div>
        )}

        {/* Net Worth Chart */}
        {showNetWorth && filteredNetWorth.length >= 2 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '360ms' }}>
            <NetWorthChart data={filteredNetWorth} />
          </div>
        )}

        {/* Bottom row: Merchants + Monthly Table */}
        <div className={`grid grid-cols-1 ${showMerchants ? 'lg:grid-cols-[340px_1fr]' : ''} gap-4`}>

          {/* Top Merchants */}
          {showMerchants && (
            <div className="animate-fade-in-up" style={{ animationDelay: '420ms' }}>
              <div className="bg-surface-1 border border-border-dim rounded-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dim">
                  <Store className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Top Merchants</h3>
                </div>
                <div className="divide-y divide-border-dim">
                  {topMerchants.slice(0, 10).map((merchant, i) => (
                    <div key={merchant.name} className="flex items-center justify-between px-4 py-3 hover:bg-surface-2/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-text-muted w-5 shrink-0 tabular-nums text-right">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{merchant.name}</div>
                          <div className="text-xs text-text-muted">
                            {merchant.transactions} transactions &middot; {merchant.category}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-semibold tabular-nums text-text-primary shrink-0 ml-3">
                        ${fmt(merchant.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Summary Table */}
          {showTable && filteredSummaries.length > 0 && (
            <div className="animate-fade-in-up" style={{ animationDelay: '480ms' }}>
              <div className="bg-surface-1 border border-border-dim rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dim">
                  <Hash className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Monthly Summary</h3>
                </div>

                <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-2.5 border-b border-border-dim bg-surface-2/40">
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Month</span>
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Income</span>
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Expenses</span>
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Net</span>
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Savings</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border-dim">
                  {[...filteredSummaries].reverse().map(m => (
                    <div key={m.month} className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-3 hover:bg-surface-2/30 transition-colors">
                      <span className="text-sm text-text-primary">{m.label}</span>
                      <span className="text-sm font-mono tabular-nums text-accent-mint text-right">
                        ${fmt(m.income)}
                      </span>
                      <span className="text-sm font-mono tabular-nums text-accent-rose text-right">
                        ${fmt(m.expenses)}
                      </span>
                      <span className={`text-sm font-mono font-semibold tabular-nums text-right ${m.net >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                        {m.net >= 0 ? '+' : '-'}${fmt(Math.abs(m.net))}
                      </span>
                      <span className={`text-sm font-mono tabular-nums text-right ${m.savingsRate >= 30 ? 'text-accent-mint' : m.savingsRate >= 20 ? 'text-text-primary' : 'text-accent-amber'}`}>
                        {m.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Table footer - totals/averages */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-3 border-t border-border-default bg-surface-2/40">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Average</span>
                  <span className="text-sm font-mono font-semibold tabular-nums text-accent-mint text-right">
                    ${fmt(metrics.avgIncome)}
                  </span>
                  <span className="text-sm font-mono font-semibold tabular-nums text-accent-rose text-right">
                    ${fmt(metrics.avgExpenses)}
                  </span>
                  <span className={`text-sm font-mono font-semibold tabular-nums text-right ${metrics.totalSaved >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                    +${fmt(metrics.avgIncome - metrics.avgExpenses)}
                  </span>
                  <span className="text-sm font-mono font-semibold tabular-nums text-accent-sky text-right">
                    {metrics.savingsRate.toFixed(1)}%
                  </span>
                </div>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
