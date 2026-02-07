export type ConnectionStatus = 'connected' | 'error' | 'syncing';

export type SyncFrequency = 'every_4h' | 'every_12h' | 'daily' | 'manual';

export interface LinkedAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  lastFour: string;
  syncEnabled: boolean;
  lastBalance: number;
}

export interface BankConnection {
  id: string;
  institution: string;
  institutionColor: string;
  status: ConnectionStatus;
  accounts: LinkedAccount[];
  lastSync: string; // ISO timestamp
  errorMessage?: string;
  addedDate: string;
}

export interface SyncEvent {
  id: string;
  timestamp: string;
  institution: string;
  status: 'success' | 'error' | 'partial';
  accountsSynced: number;
  transactionsPulled: number;
  duration: number; // seconds
  errorMessage?: string;
}

export interface SyncSettings {
  autoSync: boolean;
  frequency: SyncFrequency;
  syncOnOpen: boolean;
  notifyOnError: boolean;
}

export const SYNC_FREQUENCY_LABELS: Record<SyncFrequency, string> = {
  every_4h: 'Every 4 hours',
  every_12h: 'Every 12 hours',
  daily: 'Once daily',
  manual: 'Manual only',
};

export const MOCK_INSTITUTIONS = [
  { name: 'Chase', color: '#117ACA' },
  { name: 'Bank of America', color: '#E31837' },
  { name: 'Wells Fargo', color: '#D71E28' },
  { name: 'Citi', color: '#003B70' },
  { name: 'Capital One', color: '#004977' },
  { name: 'US Bank', color: '#D50032' },
  { name: 'Marcus by Goldman Sachs', color: '#1D1D1D' },
  { name: 'Ally Bank', color: '#6B1F7C' },
  { name: 'Fidelity Investments', color: '#4B8A3A' },
  { name: 'Vanguard', color: '#96282A' },
  { name: 'Charles Schwab', color: '#00A0DF' },
  { name: 'Coinbase', color: '#0052FF' },
  { name: 'American Express', color: '#006FCF' },
  { name: 'Discover', color: '#FF6600' },
  { name: 'Navy Federal', color: '#003366' },
  { name: 'USAA', color: '#00539B' },
];

export const mockBankConnections: BankConnection[] = [
  {
    id: 'bc1',
    institution: 'Chase',
    institutionColor: '#117ACA',
    status: 'connected',
    lastSync: '2026-01-31T08:32:00Z',
    addedDate: '2025-06-15',
    accounts: [
      { id: 'la1', name: 'Primary Checking', type: 'checking', lastFour: '4521', syncEnabled: true, lastBalance: 4832.41 },
      { id: 'la2', name: 'Direct Deposit', type: 'checking', lastFour: '8810', syncEnabled: true, lastBalance: 1205.33 },
      { id: 'la3', name: 'Sapphire Preferred', type: 'credit_card', lastFour: '9012', syncEnabled: true, lastBalance: -1247.63 },
    ],
  },
  {
    id: 'bc2',
    institution: 'Fidelity Investments',
    institutionColor: '#4B8A3A',
    status: 'connected',
    lastSync: '2026-01-31T06:15:00Z',
    addedDate: '2025-07-02',
    accounts: [
      { id: 'la4', name: 'Brokerage', type: 'investment', lastFour: '3301', syncEnabled: true, lastBalance: 32450.82 },
      { id: 'la5', name: '401(k)', type: 'investment', lastFour: '6645', syncEnabled: true, lastBalance: 67320.15 },
      { id: 'la6', name: 'HSA', type: 'savings', lastFour: '4410', syncEnabled: false, lastBalance: 8750.00 },
    ],
  },
  {
    id: 'bc3',
    institution: 'Marcus by Goldman Sachs',
    institutionColor: '#1D1D1D',
    status: 'error',
    lastSync: '2026-01-28T14:20:00Z',
    addedDate: '2025-08-10',
    errorMessage: 'Authentication expired. Please re-authenticate with your institution.',
    accounts: [
      { id: 'la7', name: 'High-Yield Savings', type: 'savings', lastFour: '7833', syncEnabled: true, lastBalance: 18250.00 },
    ],
  },
  {
    id: 'bc4',
    institution: 'Ally Bank',
    institutionColor: '#6B1F7C',
    status: 'connected',
    lastSync: '2026-01-31T07:45:00Z',
    addedDate: '2025-09-22',
    accounts: [
      { id: 'la8', name: 'Emergency Fund', type: 'savings', lastFour: '2209', syncEnabled: true, lastBalance: 10000.00 },
    ],
  },
  {
    id: 'bc5',
    institution: 'Vanguard',
    institutionColor: '#96282A',
    status: 'connected',
    lastSync: '2026-01-30T22:10:00Z',
    addedDate: '2025-10-05',
    accounts: [
      { id: 'la9', name: 'Roth IRA', type: 'investment', lastFour: '1190', syncEnabled: true, lastBalance: 24800.00 },
    ],
  },
  {
    id: 'bc6',
    institution: 'American Express',
    institutionColor: '#006FCF',
    status: 'connected',
    lastSync: '2026-01-31T09:00:00Z',
    addedDate: '2025-11-18',
    accounts: [
      { id: 'la10', name: 'Blue Cash Everyday', type: 'credit_card', lastFour: '5567', syncEnabled: true, lastBalance: -432.18 },
    ],
  },
];

export const mockSyncEvents: SyncEvent[] = [
  { id: 'se1', timestamp: '2026-01-31T09:00:00Z', institution: 'American Express', status: 'success', accountsSynced: 1, transactionsPulled: 3, duration: 2 },
  { id: 'se2', timestamp: '2026-01-31T08:32:00Z', institution: 'Chase', status: 'success', accountsSynced: 3, transactionsPulled: 12, duration: 4 },
  { id: 'se3', timestamp: '2026-01-31T07:45:00Z', institution: 'Ally Bank', status: 'success', accountsSynced: 1, transactionsPulled: 0, duration: 2 },
  { id: 'se4', timestamp: '2026-01-31T06:15:00Z', institution: 'Fidelity Investments', status: 'success', accountsSynced: 2, transactionsPulled: 5, duration: 3 },
  { id: 'se5', timestamp: '2026-01-30T22:10:00Z', institution: 'Vanguard', status: 'success', accountsSynced: 1, transactionsPulled: 1, duration: 2 },
  { id: 'se6', timestamp: '2026-01-28T14:20:00Z', institution: 'Marcus by Goldman Sachs', status: 'error', accountsSynced: 0, transactionsPulled: 0, duration: 8, errorMessage: 'ITEM_LOGIN_REQUIRED' },
  { id: 'se7', timestamp: '2026-01-28T08:30:00Z', institution: 'Chase', status: 'success', accountsSynced: 3, transactionsPulled: 7, duration: 3 },
  { id: 'se8', timestamp: '2026-01-27T12:00:00Z', institution: 'Fidelity Investments', status: 'partial', accountsSynced: 2, transactionsPulled: 3, duration: 6, errorMessage: 'HSA account timed out' },
  { id: 'se9', timestamp: '2026-01-27T08:15:00Z', institution: 'Ally Bank', status: 'success', accountsSynced: 1, transactionsPulled: 2, duration: 2 },
  { id: 'se10', timestamp: '2026-01-26T09:00:00Z', institution: 'American Express', status: 'success', accountsSynced: 1, transactionsPulled: 4, duration: 2 },
];

export const mockSyncSettings: SyncSettings = {
  autoSync: true,
  frequency: 'every_12h',
  syncOnOpen: true,
  notifyOnError: true,
};
