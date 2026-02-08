import { format } from 'date-fns';
import {
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PiggyBank,
  BarChart3,
  ArrowRight,
  Receipt,
  CalendarClock,
  Landmark,
  AlertTriangle,
  CircleCheck,
} from 'lucide-react';
import type { Account } from '../data/mockDashboard';
import { useDashboard } from '../hooks/useDashboard';

function MetricCard({ label, value, icon: Icon, accent, accentBg, change, delay }: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
  change?: { value: string; positive: boolean };
  delay: number;
}) {
  return (
    <div
      className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accentBg}`}>
          <Icon className={`w-3.5 h-3.5 ${accent}`} />
        </div>
      </div>
      <div className={`text-lg sm:text-2xl font-mono font-semibold tabular-nums truncate ${accent}`}>{value}</div>
      {change && (
        <div className="flex items-center gap-1 mt-1.5">
          {change.positive ? (
            <ArrowUpRight className="w-3 h-3 text-accent-mint" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-accent-rose" />
          )}
          <span className={`text-xs font-medium ${change.positive ? 'text-accent-mint' : 'text-accent-rose'}`}>
            {change.value}
          </span>
          <span className="text-xs text-text-muted">vs last period</span>
        </div>
      )}
    </div>
  );
}

function SparklineChart({ data }: { data: { month: string; value: number }[] }) {
  if (data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 240;
  const height = 64;
  const padding = 4;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * usableW;
    const y = padding + usableH - ((v - min) / range) * usableH;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${padding + usableW},${height} L ${padding},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-mint)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--color-accent-mint)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={linePath} fill="none" stroke="var(--color-accent-mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={padding + usableW}
        cy={padding + usableH - ((values[values.length - 1] - min) / range) * usableH}
        r="3"
        fill="var(--color-accent-mint)"
      />
    </svg>
  );
}

function AccountIcon({ type }: { type: Account['type'] }) {
  const config = {
    checking: { icon: Wallet, accent: 'text-accent-sky', bg: 'bg-accent-sky-dim' },
    savings: { icon: PiggyBank, accent: 'text-accent-mint', bg: 'bg-accent-mint-dim' },
    credit_card: { icon: CreditCard, accent: 'text-accent-rose', bg: 'bg-accent-rose-dim' },
    investment: { icon: Landmark, accent: 'text-accent-violet', bg: 'bg-accent-violet-dim' },
    loan: { icon: Landmark, accent: 'text-accent-amber', bg: 'bg-accent-amber-dim' },
  }[type] ?? { icon: Wallet, accent: 'text-text-muted', bg: 'bg-surface-2' };
  const Icon = config.icon;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.accent}`} />
    </div>
  );
}

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: dashboard, isLoading, isError } = useDashboard();

  const today = new Date();
  const halfLabel = today.getDate() <= 15 ? 'first half' : 'second half';
  const halfShort = today.getDate() <= 15 ? '1H' : '2H';

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError || !dashboard) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load data.</p></div>;

  const { periodMetrics, accounts: dashAccounts, recentTransactions, upcomingBills, netWorth, spending } = dashboard;
  const latestNetWorth = netWorth.netWorth;
  // We don't have historical net worth from the dashboard endpoint, so no % change
  const nwChange = 0;
  const nwPct = '0.0';
  const totalSpending = spending.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-10 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-sky-dim flex items-center justify-center">
                <Home className="w-4 h-4 text-accent-sky" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Dashboard</h1>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-1 border border-border-dim">
              <span className="text-sm font-medium text-text-primary">
                {format(today, 'MMMM yyyy')}
              </span>
              <span className="text-xs text-accent-sky ml-2 font-mono">{halfShort}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Greeting */}
        <div className="animate-fade-in-up">
          <h2 className="text-xl font-semibold text-text-primary">Good evening</h2>
          <p className="text-sm text-text-muted mt-0.5">Here's your financial snapshot for the {halfLabel} of {format(today, 'MMMM')}.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Total Balance"
            value={`$${periodMetrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            accent="text-accent-sky"
            accentBg="bg-accent-sky-dim"
            change={{ value: '+2.8%', positive: true }}
            delay={0}
          />
          <MetricCard
            label="Income"
            value={`$${periodMetrics.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            accent="text-accent-mint"
            accentBg="bg-accent-mint-dim"
            delay={60}
          />
          <MetricCard
            label="Expenses"
            value={`$${periodMetrics.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            accent="text-accent-rose"
            accentBg="bg-accent-rose-dim"
            change={{ value: '+12.3%', positive: false }}
            delay={120}
          />
          <MetricCard
            label="Net Cash Flow"
            value={`+$${periodMetrics.netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={BarChart3}
            accent="text-accent-mint"
            accentBg="bg-accent-mint-dim"
            delay={180}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left column: Transactions + Spending */}
          <div className="lg:col-span-2 space-y-4">

            {/* Recent Transactions */}
            <div className="bg-surface-1 border border-border-dim rounded-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Recent Transactions</h3>
                </div>
                <button
                  onClick={() => onNavigate?.('transactions')}
                  className="flex items-center gap-1 text-xs text-accent-sky hover:text-accent-sky/80 font-medium transition-colors cursor-pointer"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-border-dim">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${tx.amount > 0 ? 'bg-accent-mint-dim' : 'bg-surface-2'}
                      `}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-accent-mint" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{tx.description}</div>
                        <div className="text-xs text-text-muted">
                          {tx.category} &middot; {tx.accountName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className={`text-sm font-mono font-semibold tabular-nums ${tx.amount > 0 ? 'text-accent-mint' : 'text-text-primary'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-text-muted">{format(new Date(tx.date), 'MMM d')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Breakdown */}
            <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '260ms' }}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
                Spending Breakdown
              </h3>
              {/* Stacked bar */}
              <div className="h-3 rounded-full bg-surface-2 overflow-hidden flex mb-4">
                {spending.map((cat) => (
                  <div
                    key={cat.name}
                    className={`h-full ${cat.bgColor} first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${totalSpending > 0 ? (cat.amount / totalSpending) * 100 : 0}%`, opacity: 0.7 }}
                    title={`${cat.name}: $${cat.amount}`}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {spending.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${cat.bgColor}`} style={{ opacity: 0.7 }} />
                      <span className="text-xs text-text-secondary truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted tabular-nums shrink-0">
                      ${cat.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cash Flow Projection */}
            {(() => {
              const checkingAccounts = dashAccounts.filter(a => a.type === 'checking');
              const totalBillsDue = upcomingBills.reduce((s, b) => s + Math.abs(b.amount), 0);

              return (
                <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Cash Flow Projection
                    </h3>
                    <span className="text-[10px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-md">
                      This period
                    </span>
                  </div>

                  <div className="space-y-4">
                    {checkingAccounts.map((acct) => {
                      const projected = acct.balance - totalBillsDue;
                      const isShortfall = projected < 0;
                      const barPct = Math.min(100, Math.max(0, (projected / acct.balance) * 100));

                      return (
                        <div key={acct.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-3.5 h-3.5 text-accent-sky" />
                              <span className="text-sm font-medium text-text-primary">{acct.name}</span>
                              <span className="text-xs text-text-muted">&middot;&middot;&middot;&middot; {acct.lastFour}</span>
                            </div>
                          </div>

                          {/* Balance breakdown */}
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Current</div>
                              <div className="text-sm font-mono font-semibold tabular-nums text-text-primary">
                                ${acct.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Bills Due</div>
                              <div className="text-sm font-mono font-semibold tabular-nums text-accent-rose">
                                -${totalBillsDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Projected</div>
                              <div className={`text-sm font-mono font-semibold tabular-nums ${isShortfall ? 'text-accent-rose' : 'text-accent-mint'}`}>
                                {isShortfall ? '-' : ''}${Math.abs(projected).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isShortfall ? 'bg-accent-rose' : 'bg-accent-mint'}`}
                              style={{ width: `${isShortfall ? 100 : barPct}%`, opacity: isShortfall ? 0.6 : 0.5 }}
                            />
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {isShortfall ? (
                              <>
                                <AlertTriangle className="w-3 h-3 text-accent-rose" />
                                <span className="text-xs text-accent-rose font-medium">
                                  Shortfall of ${Math.abs(projected).toLocaleString('en-US', { minimumFractionDigits: 2 })} after bills
                                </span>
                              </>
                            ) : (
                              <>
                                <CircleCheck className="w-3 h-3 text-accent-mint" />
                                <span className="text-xs text-accent-mint font-medium">
                                  ${projected.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining after bills
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total summary */}
                  {checkingAccounts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border-dim">
                      {(() => {
                        const totalChecking = checkingAccounts.reduce((s, a) => s + a.balance, 0);
                        const totalProjected = totalChecking - totalBillsDue;
                        const isShortfall = totalProjected < 0;
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                              Total after all bills
                            </span>
                            <span className={`text-sm font-mono font-bold tabular-nums ${isShortfall ? 'text-accent-rose' : 'text-accent-mint'}`}>
                              {isShortfall ? '-' : ''}${Math.abs(totalProjected).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right column: Sidebar */}
          <div className="space-y-4">

            {/* Net Worth */}
            <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Net Worth</h3>
                <div className="flex items-center gap-1">
                  {nwChange >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-accent-mint" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-accent-rose" />
                  )}
                  <span className={`text-xs font-medium ${nwChange >= 0 ? 'text-accent-mint' : 'text-accent-rose'}`}>
                    {nwChange >= 0 ? '+' : ''}{nwPct}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-mono font-semibold text-text-primary tabular-nums mb-3">
                ${latestNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <SparklineChart data={[{ month: format(today, 'MMM'), value: latestNetWorth }]} />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-text-muted">{format(today, 'MMM')}</span>
              </div>
            </div>

            {/* Accounts */}
            <div className="bg-surface-1 border border-border-dim rounded-xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="px-4 py-3 border-b border-border-dim">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Accounts</h3>
              </div>
              <div className="divide-y divide-border-dim">
                {dashAccounts.map((acct) => (
                  <div key={acct.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <AccountIcon type={acct.type} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{acct.name}</div>
                        <div className="text-xs text-text-muted">{acct.institution} &middot;&middot;&middot;&middot; {acct.lastFour}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-mono font-semibold tabular-nums shrink-0 ml-2 ${acct.balance < 0 ? 'text-accent-rose' : 'text-text-primary'}`}>
                      {acct.balance < 0 ? '-' : ''}${Math.abs(acct.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className="bg-surface-1 border border-border-dim rounded-xl animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Upcoming Bills</h3>
                </div>
                <button
                  onClick={() => onNavigate?.('bills')}
                  className="flex items-center gap-1 text-xs text-accent-sky hover:text-accent-sky/80 font-medium transition-colors cursor-pointer"
                >
                  All bills <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-border-dim">
                {upcomingBills.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <CircleCheck className="w-5 h-5 text-accent-mint mx-auto mb-1.5" />
                    <p className="text-sm text-text-muted">No bills due in the next 14 days</p>
                  </div>
                ) : upcomingBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{bill.name}</div>
                      <div className={`text-xs ${bill.daysUntil <= 2 ? 'text-accent-amber' : 'text-text-muted'}`}>
                        {bill.daysUntil === 0 ? 'Due today' :
                         bill.daysUntil === 1 ? 'Due tomorrow' :
                         `Due in ${bill.daysUntil} days`}
                      </div>
                    </div>
                    <span className="text-sm font-mono font-semibold text-text-primary tabular-nums">
                      ${Math.abs(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
