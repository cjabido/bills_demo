import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';
import { Home, Receipt, Landmark, ArrowLeftRight, TrendingUp, Settings, BarChart3, PieChart } from 'lucide-react';
import DashboardPage from './components/DashboardPage';
import BillsPage from './components/BillsPage';
import AccountsPage from './components/AccountsPage';
import TransactionsPage from './components/TransactionsPage';
import AssetTrackerPage from './components/AssetTrackerPage';
import BankIntegrationPage from './components/BankIntegrationPage';
import SettingsPage from './components/SettingsPage';
import CashFlowPage from './components/CashFlowPage';
import ReportsPage from './components/ReportsPage';
import DemoBanner from './components/DemoBanner';

const persister = {
  persistClient: async (client: PersistedClient) => {
    await set('FINANCE_QUERY_CACHE', client);
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    return await get('FINANCE_QUERY_CACHE');
  },
  removeClient: async () => {
    await del('FINANCE_QUERY_CACHE');
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

type Page = 'dashboard' | 'bills' | 'accounts' | 'transactions' | 'assets' | 'banks' | 'settings' | 'cashflow' | 'reports';

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <div className="flex min-h-screen bg-surface-0">
        {/* Sidebar nav */}
        <nav className="fixed left-0 top-0 bottom-0 w-14 bg-surface-1 border-r border-border-dim flex flex-col items-center py-4 gap-2 z-40">
          <div className="w-8 h-8 rounded-lg bg-accent-sky/15 flex items-center justify-center mb-4">
            <span className="text-sm font-bold text-accent-sky font-mono">F</span>
          </div>

          <button
            onClick={() => setPage('dashboard')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'dashboard'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Dashboard"
          >
            <Home className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('cashflow')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'cashflow'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Cash Flow"
          >
            <BarChart3 className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('bills')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'bills'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Bills"
          >
            <Receipt className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('accounts')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'accounts'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Accounts"
          >
            <Landmark className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('transactions')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'transactions'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Transactions"
          >
            <ArrowLeftRight className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('assets')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'assets'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Assets"
          >
            <TrendingUp className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('reports')}
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'reports'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Reports"
          >
            <PieChart className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setPage('settings')}
            className={`
            mt-auto w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer
            ${page === 'settings'
                ? 'bg-accent-sky-dim text-accent-sky'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }
          `}
            title="Settings"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </nav>

        {/* Main content */}
        <div className="flex-1 ml-14">
          <DemoBanner />
          {page === 'dashboard' && <DashboardPage onNavigate={(p) => setPage(p as Page)} />}
          {page === 'bills' && <BillsPage />}
          {page === 'accounts' && <AccountsPage />}
          {page === 'transactions' && <TransactionsPage />}
          {page === 'assets' && <AssetTrackerPage />}
          {page === 'banks' && <BankIntegrationPage />}
          {page === 'settings' && <SettingsPage onNavigate={(p) => setPage(p as Page)} />}
          {page === 'cashflow' && <CashFlowPage />}
          {page === 'reports' && <ReportsPage />}
        </div>
      </div>
    </PersistQueryClientProvider>
  );
}

export default App;
