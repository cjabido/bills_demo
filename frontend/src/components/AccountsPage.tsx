import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Landmark,
  Plus,
  Save,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Building2,
  X,
  Eye,
  EyeOff,
  Pencil,
  ChevronDown,
  ChevronRight,
  BadgeDollarSign,
  ShieldMinus,
  Scale,
} from 'lucide-react';
import {
  ACCOUNT_GROUPS,
  type AccountDetail,
  type AccountType,
} from '../data/mockAccounts';
import { useAccounts, useCreateAccount, useUpdateAccount, useToggleAccountActive } from '../hooks/useAccounts';

const TYPE_ICON: Record<AccountType, React.ElementType> = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: Building2,
};

const TYPE_STYLE: Record<AccountType, { accent: string; bg: string }> = {
  checking: { accent: 'text-accent-sky', bg: 'bg-accent-sky-dim' },
  savings: { accent: 'text-accent-mint', bg: 'bg-accent-mint-dim' },
  investment: { accent: 'text-accent-violet', bg: 'bg-accent-violet-dim' },
  credit_card: { accent: 'text-accent-rose', bg: 'bg-accent-rose-dim' },
  loan: { accent: 'text-accent-amber', bg: 'bg-accent-amber-dim' },
};

function formatBalance(amount: number, isLiability: boolean) {
  const display = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (isLiability) return `-$${display}`;
  return `$${display}`;
}

// --- Add Account Modal ---

type AccountPayload = Omit<AccountDetail, 'id' | 'isActive' | 'lastUpdated' | 'isTaxable'> & { isTaxable?: boolean };

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (acct: AccountPayload) => void;
  editAccount?: AccountDetail | null;
  onEdit?: (id: string, acct: AccountPayload) => void;
}

function AddAccountModal({ isOpen, onClose, onAdd, editAccount, onEdit }: AddAccountModalProps) {
  const isEditMode = !!editAccount;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [institution, setInstitution] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [balance, setBalance] = useState('');
  const [isTaxable, setIsTaxable] = useState(true);

  // Pre-fill form when editing
  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setInstitution(editAccount.institution);
      setLastFour(editAccount.lastFour);
      setBalance(String(editAccount.balance));
      setIsTaxable(editAccount.isTaxable);
    }
  }, [editAccount]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName(''); setType('checking'); setInstitution(''); setLastFour(''); setBalance(''); setIsTaxable(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !institution || !balance) return;
    const payload: AccountPayload = {
      name,
      type,
      institution,
      lastFour,
      balance: parseFloat(balance),
      ...(type === 'investment' ? { isTaxable } : {}),
    };
    if (isEditMode && onEdit) {
      onEdit(editAccount.id, payload);
    } else {
      onAdd(payload);
    }
    resetForm();
    onClose();
  };

  const typeOptions: { key: AccountType; label: string }[] = [
    { key: 'checking', label: 'Checking' },
    { key: 'savings', label: 'Savings' },
    { key: 'investment', label: 'Investment' },
    { key: 'credit_card', label: 'Credit Card' },
    { key: 'loan', label: 'Loan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface-1 border border-border-default rounded-2xl shadow-2xl shadow-black/10 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">{isEditMode ? 'Edit Account' : 'Add Account'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Account Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Primary Checking"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors" required />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Type</label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(opt => {
                const style = TYPE_STYLE[opt.key];
                const selected = type === opt.key;
                return (
                  <button key={opt.key} type="button" onClick={() => setType(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                      ${selected ? `${style.bg} ${style.accent} ring-1 ring-current/20` : 'bg-surface-2 text-text-muted hover:text-text-secondary hover:bg-surface-3'}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Taxable checkbox (only for investment accounts) */}
          {type === 'investment' && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50 border border-border-dim">
              <input
                type="checkbox"
                id="isTaxable"
                checked={isTaxable}
                onChange={e => setIsTaxable(e.target.checked)}
                className="w-4 h-4 rounded border-border-default text-accent-violet focus:ring-accent-violet/20 cursor-pointer"
              />
              <label htmlFor="isTaxable" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium text-text-primary">Taxable Account</span>
                <span className="block text-xs text-text-muted mt-0.5">
                  Uncheck for tax-advantaged accounts (401k, IRA, HSA)
                </span>
              </label>
            </div>
          )}

          {/* Institution + Last Four */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Institution</label>
              <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Chase"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Last 4 Digits</label>
              <input type="text" maxLength={4} value={lastFour} onChange={e => setLastFour(e.target.value.replace(/\D/g, ''))} placeholder="0000"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors" />
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Current Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
              <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors" required />
            </div>
          </div>

          <button type="submit"
            className="w-full mt-2 py-2.5 rounded-lg bg-accent-sky/15 hover:bg-accent-sky/25 text-accent-sky text-sm font-semibold border border-accent-sky/20 hover:border-accent-sky/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer">
            {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function AccountsPage() {
  const { data: accounts = [], isLoading, isError } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const toggleAccountActive = useToggleAccountActive();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountDetail | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<AccountType>>(new Set());

  const toggleGroup = (type: AccountType) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleActive = (id: string) => {
    toggleAccountActive.mutate(id);
  };

  const handleAddAccount = (acct: AccountPayload) => {
    createAccount.mutate(acct);
  };

  const handleEditAccount = (id: string, acct: AccountPayload) => {
    updateAccount.mutate({ id, ...acct });
  };

  const grouped = useMemo(() => {
    return ACCOUNT_GROUPS.map(group => ({
      ...group,
      accounts: accounts.filter(a => a.type === group.type),
      subtotal: accounts
        .filter(a => a.type === group.type && a.isActive)
        .reduce((sum, a) => sum + a.balance, 0),
    })).filter(g => g.accounts.length > 0);
  }, [accounts]);

  const totalAssets = useMemo(
    () => grouped.filter(g => !g.isLiability).reduce((sum, g) => sum + g.subtotal, 0),
    [grouped]
  );
  const totalLiabilities = useMemo(
    () => grouped.filter(g => g.isLiability).reduce((sum, g) => sum + g.subtotal, 0),
    [grouped]
  );
  const netWorth = totalAssets - totalLiabilities;

  if (isLoading) return <div className="flex-1 p-6"><p className="text-text-muted text-sm">Loading...</p></div>;
  if (isError) return <div className="flex-1 p-6"><p className="text-accent-rose text-sm">Failed to load data.</p></div>;

  return (
    <div className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-10 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-violet-dim flex items-center justify-center">
                <Landmark className="w-4 h-4 text-accent-violet" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Accounts</h1>
            </div>
            <button onClick={() => { setEditAccount(null); setShowAddModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-sky/10 hover:bg-accent-sky/20 text-accent-sky text-xs font-semibold border border-accent-sky/15 hover:border-accent-sky/25 transition-all duration-150 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              Add Account
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Net Worth Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Assets</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim">
                <BadgeDollarSign className="w-3.5 h-3.5 text-accent-mint" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-mint">
              ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {grouped.filter(g => !g.isLiability).reduce((n, g) => n + g.accounts.filter(a => a.isActive).length, 0)} active accounts
            </div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Liabilities</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-rose-dim">
                <ShieldMinus className="w-3.5 h-3.5 text-accent-rose" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-rose">
              -${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {grouped.filter(g => g.isLiability).reduce((n, g) => n + g.accounts.filter(a => a.isActive).length, 0)} active accounts
            </div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Net Worth</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-sky-dim">
                <Scale className="w-3.5 h-3.5 text-accent-sky" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-semibold tabular-nums text-accent-sky">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {accounts.filter(a => a.isActive).length} of {accounts.length} accounts active
            </div>
          </div>
        </div>

        {/* Account Groups */}
        <div className="space-y-4">
          {grouped.map((group, gi) => {
            const Icon = TYPE_ICON[group.type];
            const style = TYPE_STYLE[group.type];
            const collapsed = collapsedGroups.has(group.type);

            return (
              <div key={group.type} className="animate-fade-in-up" style={{ animationDelay: `${180 + gi * 60}ms` }}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.type)}
                  className="flex items-center justify-between w-full mb-2 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {collapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${style.accent}`} />
                    <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      {group.label}
                    </h2>
                    <span className="text-xs text-text-muted">({group.accounts.length})</span>
                  </div>
                  <span className={`text-sm font-mono font-semibold tabular-nums ${group.isLiability ? 'text-accent-rose' : style.accent}`}>
                    {group.isLiability ? '-' : ''}${Math.abs(group.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </button>

                {/* Account rows */}
                {!collapsed && (
                  <div className="space-y-2">
                    {group.accounts.map((acct) => (
                      <div
                        key={acct.id}
                        className={`
                          group/row flex items-center gap-4 px-4 py-3.5
                          bg-surface-1 border border-border-dim rounded-lg
                          hover:bg-surface-2/60 hover:border-border-default
                          transition-all duration-200
                          ${!acct.isActive ? 'opacity-50' : ''}
                        `}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg}`}>
                          <Icon className={`w-4 h-4 ${style.accent}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary truncate">{acct.name}</span>
                            {!acct.isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-muted font-medium">Inactive</span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted mt-0.5">
                            {acct.institution} &middot;&middot;&middot;&middot; {acct.lastFour}
                            <span className="mx-1.5">&middot;</span>
                            Updated {format(new Date(acct.lastUpdated), 'MMM d')}
                          </div>
                        </div>

                        {/* Balance + Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-mono font-semibold tabular-nums ${group.isLiability ? 'text-accent-rose' : 'text-text-primary'}`}>
                            {formatBalance(acct.balance, group.isLiability)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-150">
                            <button
                              onClick={() => { setEditAccount(acct); setShowAddModal(true); }}
                              className="w-8 h-8 rounded-lg hidden sm:flex items-center justify-center bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text-secondary transition-all duration-150 cursor-pointer"
                              title="Edit account"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleActive(acct.id)}
                              className="w-8 h-8 rounded-lg hidden sm:flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-all duration-150 cursor-pointer"
                              title={acct.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {acct.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditAccount(null); }}
        onAdd={handleAddAccount}
        editAccount={editAccount}
        onEdit={handleEditAccount}
      />
    </div>
  );
}
