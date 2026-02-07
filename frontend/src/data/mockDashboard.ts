export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  institution: string;
  balance: number;
  lastFour: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  accountName: string;
}

export interface NetWorthPoint {
  month: string;
  value: number;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
  bgColor: string;
}

export const mockAccounts: Account[] = [
  { id: '1', name: 'Primary Checking', type: 'checking', institution: 'Chase', balance: 4832.41, lastFour: '4521' },
  { id: '2', name: 'High-Yield Savings', type: 'savings', institution: 'Marcus', balance: 18250.00, lastFour: '7833' },
  { id: '3', name: 'Sapphire Preferred', type: 'credit_card', institution: 'Chase', balance: -1247.63, lastFour: '9012' },
  { id: '4', name: 'Brokerage', type: 'investment', institution: 'Fidelity', balance: 32450.82, lastFour: '3301' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', description: 'Whole Foods Market', amount: -87.32, date: '2026-01-31', category: 'Groceries', accountName: 'Primary Checking' },
  { id: '2', description: 'Payroll Deposit', amount: 3250.00, date: '2026-01-31', category: 'Income', accountName: 'Primary Checking' },
  { id: '3', description: 'Shell Gas Station', amount: -52.40, date: '2026-01-30', category: 'Transportation', accountName: 'Sapphire Preferred' },
  { id: '4', description: 'Netflix', amount: -22.99, date: '2026-01-29', category: 'Subscriptions', accountName: 'Sapphire Preferred' },
  { id: '5', description: 'Transfer to Savings', amount: -500.00, date: '2026-01-28', category: 'Transfer', accountName: 'Primary Checking' },
  { id: '6', description: 'Amazon.com', amount: -134.56, date: '2026-01-27', category: 'Shopping', accountName: 'Sapphire Preferred' },
  { id: '7', description: 'Uber Eats', amount: -28.90, date: '2026-01-26', category: 'Dining', accountName: 'Primary Checking' },
];

export const mockNetWorth: NetWorthPoint[] = [
  { month: 'Aug', value: 48200 },
  { month: 'Sep', value: 49800 },
  { month: 'Oct', value: 51100 },
  { month: 'Nov', value: 50400 },
  { month: 'Dec', value: 52800 },
  { month: 'Jan', value: 54285 },
];

export const mockSpending: SpendingCategory[] = [
  { name: 'Rent', amount: 2150, color: 'text-accent-rose', bgColor: 'bg-accent-rose' },
  { name: 'Groceries', amount: 485, color: 'text-accent-mint', bgColor: 'bg-accent-mint' },
  { name: 'Transportation', amount: 312, color: 'text-accent-amber', bgColor: 'bg-accent-amber' },
  { name: 'Subscriptions', amount: 189, color: 'text-accent-violet', bgColor: 'bg-accent-violet' },
  { name: 'Dining', amount: 274, color: 'text-accent-sky', bgColor: 'bg-accent-sky' },
  { name: 'Shopping', amount: 356, color: 'text-accent-rose', bgColor: 'bg-accent-rose' },
];

export const upcomingBills = [
  { id: '1', name: 'Rent', amount: 2150.00, dueDate: '2026-02-01', daysUntil: 1 },
  { id: '2', name: 'Electric Bill', amount: 134.52, dueDate: '2026-02-03', daysUntil: 3 },
  { id: '3', name: 'Car Insurance', amount: 189.00, dueDate: '2026-02-05', daysUntil: 5 },
  { id: '4', name: 'Spotify', amount: 15.99, dueDate: '2026-02-07', daysUntil: 7 },
];

export const periodMetrics = {
  totalBalance: 54285.60,
  income: 6500.00,
  expenses: 3766.17,
  netCashFlow: 2733.83,
};
