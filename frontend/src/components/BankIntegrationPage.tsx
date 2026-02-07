import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Link2,
  Plus,
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  AlertTriangle,
  Loader2,
  Search,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Building2,
  ShieldCheck,
  Lock,
  Eye,
  // Clock,
  ArrowRight,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  mockBankConnections,
  mockSyncEvents,
  mockSyncSettings,
  MOCK_INSTITUTIONS,
  SYNC_FREQUENCY_LABELS,
  type BankConnection,
  type LinkedAccount,
  type SyncEvent,
  type SyncSettings,
  type SyncFrequency,
  type ConnectionStatus,
} from '../data/mockBankConnections';

// --- Helpers ---

const ACCOUNT_TYPE_ICON: Record<LinkedAccount['type'], React.ElementType> = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: Building2,
};

const ACCOUNT_TYPE_LABEL: Record<LinkedAccount['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  loan: 'Loan',
};

function fmt(n: number) {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-mint-dim text-accent-mint">
        <CircleCheck className="w-3 h-3" />
        Connected
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-rose-dim text-accent-rose">
        <AlertTriangle className="w-3 h-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-sky-dim text-accent-sky">
      <Loader2 className="w-3 h-3 animate-spin" />
      Syncing
    </span>
  );
}

function SyncEventBadge({ status }: { status: SyncEvent['status'] }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-mint">
        <CheckCircle2 className="w-3 h-3" />
        Success
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-rose">
        <XCircle className="w-3 h-3" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-amber">
      <AlertCircle className="w-3 h-3" />
      Partial
    </span>
  );
}

// --- Institution Logo Placeholder ---

function InstitutionLogo({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(/[\s&]+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// --- Toggle Switch ---

function ToggleSwitch({ enabled, onChange, size = 'sm' }: {
  enabled: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}) {
  const w = size === 'md' ? 'w-10' : 'w-8';
  const h = size === 'md' ? 'h-6' : 'h-5';
  const dot = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const translate = size === 'md' ? 'translate-x-[18px]' : 'translate-x-[14px]';

  return (
    <button
      onClick={onChange}
      className={`${w} ${h} rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
        enabled ? 'bg-accent-mint' : 'bg-surface-4'
      }`}
    >
      <div
        className={`${dot} rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? translate : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// --- Add Connection Modal ---

type ConnectStep = 'search' | 'connecting' | 'success';

function AddConnectionModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (conn: BankConnection) => void;
}) {
  const [step, setStep] = useState<ConnectStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<typeof MOCK_INSTITUTIONS[0] | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('search');
      setSearchQuery('');
      setSelectedInstitution(null);
    }
  }, [isOpen]);

  const filteredInstitutions = useMemo(() => {
    if (!searchQuery) return MOCK_INSTITUTIONS.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return MOCK_INSTITUTIONS.filter(i => i.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSelectInstitution = useCallback((inst: typeof MOCK_INSTITUTIONS[0]) => {
    setSelectedInstitution(inst);
    setStep('connecting');

    // Simulate connection delay
    setTimeout(() => {
      setStep('success');
    }, 2200);
  }, []);

  const handleFinish = useCallback(() => {
    if (!selectedInstitution) return;
    const newConn: BankConnection = {
      id: Date.now().toString(),
      institution: selectedInstitution.name,
      institutionColor: selectedInstitution.color,
      status: 'connected',
      lastSync: new Date().toISOString(),
      addedDate: new Date().toISOString().slice(0, 10),
      accounts: [
        {
          id: `new-${Date.now()}`,
          name: `${selectedInstitution.name} Account`,
          type: 'checking',
          lastFour: String(Math.floor(1000 + Math.random() * 9000)),
          syncEnabled: true,
          lastBalance: 0,
        },
      ],
    };
    onAdd(newConn);
    onClose();
  }, [selectedInstitution, onAdd, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface-1 border border-border-default rounded-2xl shadow-2xl shadow-black/10 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim">
          <h2 className="text-base font-semibold text-text-primary">
            {step === 'search' && 'Connect Institution'}
            {step === 'connecting' && 'Connecting...'}
            {step === 'success' && 'Connected'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {step === 'search' && (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search banks and institutions..."
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-2 border border-border-dim text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sky/50 focus:ring-1 focus:ring-accent-sky/20 transition-colors"
                />
              </div>

              {/* Institution list */}
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredInstitutions.map(inst => (
                  <button
                    key={inst.name}
                    onClick={() => handleSelectInstitution(inst)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer text-left"
                  >
                    <InstitutionLogo name={inst.name} color={inst.color} />
                    <span className="text-sm font-medium text-text-primary">{inst.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted ml-auto" />
                  </button>
                ))}
                {filteredInstitutions.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-text-muted">No institutions found</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border-dim">
                <Lock className="w-3 h-3 text-text-muted" />
                <span className="text-[10px] text-text-muted">Secured by Plaid &middot; 256-bit encryption</span>
              </div>
            </div>
          )}

          {step === 'connecting' && selectedInstitution && (
            <div className="py-8 text-center space-y-4">
              <div className="relative inline-block">
                <InstitutionLogo name={selectedInstitution.name} color={selectedInstitution.color} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-1 border border-border-dim flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-accent-sky animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Connecting to {selectedInstitution.name}</p>
                <p className="text-xs text-text-muted mt-1">Securely authenticating with your institution...</p>
              </div>
              {/* Progress bar */}
              <div className="w-48 mx-auto h-1 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-sky rounded-full"
                  style={{
                    animation: 'grow-width 2s ease-in-out forwards',
                  }}
                />
              </div>
            </div>
          )}

          {step === 'success' && selectedInstitution && (
            <div className="py-8 text-center space-y-4">
              <div className="relative inline-block">
                <InstitutionLogo name={selectedInstitution.name} color={selectedInstitution.color} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-mint flex items-center justify-center">
                  <CircleCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{selectedInstitution.name} connected</p>
                <p className="text-xs text-text-muted mt-1">1 account found and ready to sync</p>
              </div>
              <button
                onClick={handleFinish}
                className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-sky/15 hover:bg-accent-sky/25 text-accent-sky text-sm font-semibold border border-accent-sky/20 hover:border-accent-sky/30 transition-all duration-150 cursor-pointer"
              >
                <CircleCheck className="w-4 h-4" />
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function BankIntegrationPage() {
  const [connections, setConnections] = useState<BankConnection[]>(mockBankConnections);
  const [syncEvents] = useState<SyncEvent[]>(mockSyncEvents);
  const [settings, setSettings] = useState<SyncSettings>(mockSyncSettings);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  // --- Computed ---

  const totalAccounts = useMemo(
    () => connections.reduce((s, c) => s + c.accounts.length, 0),
    [connections]
  );

  const connectedCount = useMemo(
    () => connections.filter(c => c.status === 'connected').length,
    [connections]
  );

  const errorCount = useMemo(
    () => connections.filter(c => c.status === 'error').length,
    [connections]
  );

  // --- Actions ---

  const toggleExpanded = (id: string) => {
    setExpandedConnections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAccountSync = (connId: string, acctId: string) => {
    setConnections(prev => prev.map(c =>
      c.id === connId
        ? { ...c, accounts: c.accounts.map(a => a.id === acctId ? { ...a, syncEnabled: !a.syncEnabled } : a) }
        : c
    ));
  };

  const handleSyncOne = (connId: string) => {
    setSyncingIds(prev => new Set(prev).add(connId));
    setConnections(prev => prev.map(c =>
      c.id === connId ? { ...c, status: 'syncing' as ConnectionStatus } : c
    ));

    setTimeout(() => {
      setConnections(prev => prev.map(c =>
        c.id === connId
          ? { ...c, status: 'connected', lastSync: new Date().toISOString(), errorMessage: undefined }
          : c
      ));
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(connId);
        return next;
      });
    }, 2000);
  };

  const handleSyncAll = () => {
    setSyncingAll(true);
    const ids = connections.map(c => c.id);
    setSyncingIds(new Set(ids));
    setConnections(prev => prev.map(c => ({ ...c, status: 'syncing' as ConnectionStatus })));

    setTimeout(() => {
      setConnections(prev => prev.map(c => ({
        ...c,
        status: 'connected',
        lastSync: new Date().toISOString(),
        errorMessage: undefined,
      })));
      setSyncingIds(new Set());
      setSyncingAll(false);
    }, 3000);
  };

  const handleReconnect = (connId: string) => {
    handleSyncOne(connId);
  };

  const handleRemoveConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  const handleAddConnection = (conn: BankConnection) => {
    setConnections(prev => [...prev, conn]);
  };

  const updateSetting = <K extends keyof SyncSettings>(key: K, value: SyncSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-sky-dim flex items-center justify-center">
                <Link2 className="w-4 h-4 text-accent-sky" />
              </div>
              <h1 className="text-base font-semibold text-text-primary">Bank Connections</h1>
              <span className="text-xs text-text-muted font-mono">{connections.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncAll}
                disabled={syncingAll}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  syncingAll
                    ? 'bg-surface-2 text-text-muted border-border-dim cursor-not-allowed'
                    : 'bg-accent-mint/10 hover:bg-accent-mint/20 text-accent-mint border-accent-mint/15 hover:border-accent-mint/25'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
                {syncingAll ? 'Syncing...' : 'Sync All'}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-sky/10 hover:bg-accent-sky/20 text-accent-sky text-xs font-semibold border border-accent-sky/15 hover:border-accent-sky/25 transition-all duration-150 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Institutions</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-sky-dim">
                <Link2 className="w-3.5 h-3.5 text-accent-sky" />
              </div>
            </div>
            <div className="text-2xl font-mono font-semibold tabular-nums text-accent-sky">{connectedCount}</div>
            <div className="text-xs text-text-muted mt-1">{totalAccounts} linked accounts</div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Last Sync</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim">
                <RefreshCw className="w-3.5 h-3.5 text-accent-mint" />
              </div>
            </div>
            <div className="text-2xl font-mono font-semibold tabular-nums text-accent-mint">
              {syncEvents.length > 0 ? formatDistanceToNow(new Date(syncEvents[0].timestamp), { addSuffix: false }) : '—'}
            </div>
            <div className="text-xs text-text-muted mt-1">ago</div>
          </div>

          <div className="bg-surface-1 border border-border-dim rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Issues</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${errorCount > 0 ? 'bg-accent-rose-dim' : 'bg-accent-mint-dim'}`}>
                {errorCount > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-accent-rose" />
                ) : (
                  <CircleCheck className="w-3.5 h-3.5 text-accent-mint" />
                )}
              </div>
            </div>
            <div className={`text-2xl font-mono font-semibold tabular-nums ${errorCount > 0 ? 'text-accent-rose' : 'text-accent-mint'}`}>
              {errorCount}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {errorCount > 0 ? `${errorCount} connection${errorCount > 1 ? 's' : ''} need attention` : 'All connections healthy'}
            </div>
          </div>
        </div>

        {/* Main content: Connections + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Left: Connected Institutions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-text-muted" />
              <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Connected Institutions</h2>
            </div>

            <div className="space-y-3">
              {connections.map((conn, ci) => {
                const expanded = expandedConnections.has(conn.id);
                const isSyncing = syncingIds.has(conn.id);

                return (
                  <div
                    key={conn.id}
                    className={`bg-surface-1 border rounded-xl overflow-hidden transition-all duration-200 animate-fade-in-up ${
                      conn.status === 'error'
                        ? 'border-accent-rose/30'
                        : 'border-border-dim'
                    }`}
                    style={{ animationDelay: `${180 + ci * 60}ms` }}
                  >
                    {/* Institution header row */}
                    <div className="flex items-center gap-4 px-4 py-3.5">
                      <InstitutionLogo name={conn.institution} color={conn.institutionColor} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">{conn.institution}</span>
                          <StatusBadge status={conn.status} />
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {conn.accounts.length} account{conn.accounts.length !== 1 ? 's' : ''}
                          <span className="mx-1.5">&middot;</span>
                          {conn.status === 'error' ? (
                            <span className="text-accent-rose">Sync failed {formatDistanceToNow(new Date(conn.lastSync), { addSuffix: true })}</span>
                          ) : (
                            <>Synced {formatDistanceToNow(new Date(conn.lastSync), { addSuffix: true })}</>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {conn.status === 'error' ? (
                          <button
                            onClick={() => handleReconnect(conn.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-[11px] font-semibold border border-accent-rose/15 transition-all duration-150 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Reconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSyncOne(conn.id)}
                            disabled={isSyncing}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                              isSyncing
                                ? 'text-accent-sky'
                                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
                            }`}
                            title="Sync now"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpanded(conn.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                        >
                          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error banner */}
                    {conn.status === 'error' && conn.errorMessage && (
                      <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-accent-rose/5 border border-accent-rose/15">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-accent-rose shrink-0 mt-0.5" />
                          <p className="text-xs text-accent-rose">{conn.errorMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Expanded: Account-level controls */}
                    {expanded && (
                      <div className="border-t border-border-dim">
                        <div className="px-4 py-2 bg-surface-2/30">
                          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Linked Accounts</span>
                        </div>
                        <div className="divide-y divide-border-dim">
                          {conn.accounts.map(acct => {
                            const Icon = ACCOUNT_TYPE_ICON[acct.type];
                            return (
                              <div key={acct.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/30 transition-colors">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-2 shrink-0">
                                  <Icon className="w-4 h-4 text-text-muted" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-text-primary truncate">{acct.name}</div>
                                  <div className="text-xs text-text-muted">
                                    {ACCOUNT_TYPE_LABEL[acct.type]} &middot;&middot;&middot;&middot; {acct.lastFour}
                                  </div>
                                </div>
                                <span className={`text-sm font-mono font-semibold tabular-nums shrink-0 ${acct.lastBalance < 0 ? 'text-accent-rose' : 'text-text-primary'}`}>
                                  {acct.lastBalance < 0 ? '-' : ''}${fmt(acct.lastBalance)}
                                </span>
                                <ToggleSwitch
                                  enabled={acct.syncEnabled}
                                  onChange={() => toggleAccountSync(conn.id, acct.id)}
                                />
                              </div>
                            );
                          })}
                        </div>
                        {/* Footer actions */}
                        <div className="px-4 py-2.5 border-t border-border-dim bg-surface-2/20 flex items-center justify-between">
                          <span className="text-[10px] text-text-muted">
                            Connected {format(new Date(conn.addedDate), 'MMM d, yyyy')}
                          </span>
                          <button
                            onClick={() => handleRemoveConnection(conn.id)}
                            className="text-[11px] font-medium text-accent-rose/70 hover:text-accent-rose transition-colors cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {connections.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                    <Link2 className="w-5 h-5 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">No bank connections yet</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-xs font-semibold text-accent-sky hover:text-accent-sky/80 transition-colors cursor-pointer"
                  >
                    Connect your first institution
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-4">
            {/* Sync Settings */}
            <div className="bg-surface-1 border border-border-dim rounded-xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dim">
                <Settings className="w-3.5 h-3.5 text-text-muted" />
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Sync Settings</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Auto-sync toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-text-primary">Auto-sync</span>
                    <p className="text-xs text-text-muted mt-0.5">Automatically sync on a schedule</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.autoSync}
                    onChange={() => updateSetting('autoSync', !settings.autoSync)}
                    size="md"
                  />
                </div>

                {/* Frequency */}
                {settings.autoSync && (
                  <div>
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Frequency</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(SYNC_FREQUENCY_LABELS) as SyncFrequency[]).filter(f => f !== 'manual').map(freq => (
                        <button
                          key={freq}
                          onClick={() => updateSetting('frequency', freq)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer
                            ${settings.frequency === freq
                              ? 'bg-accent-sky-dim text-accent-sky ring-1 ring-accent-sky/20'
                              : 'bg-surface-2 text-text-muted hover:text-text-secondary hover:bg-surface-3'
                            }`}
                        >
                          {SYNC_FREQUENCY_LABELS[freq]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sync on open */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-text-primary">Sync on open</span>
                    <p className="text-xs text-text-muted mt-0.5">Sync when you open the app</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.syncOnOpen}
                    onChange={() => updateSetting('syncOnOpen', !settings.syncOnOpen)}
                    size="md"
                  />
                </div>

                {/* Notify on error */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-text-primary">Error alerts</span>
                    <p className="text-xs text-text-muted mt-0.5">Notify when a sync fails</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifyOnError}
                    onChange={() => updateSetting('notifyOnError', !settings.notifyOnError)}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-surface-1 border border-border-dim rounded-xl animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dim">
                <ShieldCheck className="w-3.5 h-3.5 text-text-muted" />
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Security</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-mint-dim shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5 text-accent-mint" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-primary">AES-256 Encryption</span>
                    <p className="text-xs text-text-muted mt-0.5">All credentials and tokens are encrypted at rest</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-sky-dim shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-sky" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-primary">Plaid Secured</span>
                    <p className="text-xs text-text-muted mt-0.5">Bank credentials never touch our servers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-violet-dim shrink-0 mt-0.5">
                    <Eye className="w-3.5 h-3.5 text-accent-violet" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-primary">Read-Only Access</span>
                    <p className="text-xs text-text-muted mt-0.5">We can only view transactions, never move money</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-amber-dim shrink-0 mt-0.5">
                    <Link2 className="w-3.5 h-3.5 text-accent-amber" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-primary">VPN Protected</span>
                    <p className="text-xs text-text-muted mt-0.5">App runs behind Tailscale, no public exposure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Activity Log */}
            <div className="bg-surface-1 border border-border-dim rounded-xl animate-fade-in-up" style={{ animationDelay: '420ms' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Sync Activity</h3>
                </div>
                <span className="text-[10px] text-text-muted font-mono">{syncEvents.length} events</span>
              </div>
              <div className="divide-y divide-border-dim max-h-80 overflow-y-auto">
                {syncEvents.slice(0, 8).map(event => (
                  <div key={event.id} className="px-4 py-2.5 hover:bg-surface-2/30 transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-text-primary truncate">{event.institution}</span>
                      <SyncEventBadge status={event.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted">
                        {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                      </span>
                      {event.status !== 'error' ? (
                        <span className="text-[10px] text-text-muted font-mono">
                          {event.accountsSynced} acct{event.accountsSynced !== 1 ? 's' : ''} &middot; {event.transactionsPulled} txn{event.transactionsPulled !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-[10px] text-accent-rose">{event.errorMessage}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AddConnectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddConnection}
      />
    </div>
  );
}
