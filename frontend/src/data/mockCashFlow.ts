export type PeriodHalf = '1H' | '2H';

export interface CashFlowPeriod {
  year: number;
  month: number; // 1-12
  half: PeriodHalf;
  startingBalance: number;
  endingBalance: number;
  projectedEndingBalance: number;
  totalIncome: number;
  projectedIncome: number;
  totalExpenses: number;
  projectedExpenses: number;
  totalTransfers: number;
}

export interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
  accountName: string;
  accountLastFour: string;
  isProjected: boolean;
}

export interface ExpenseEntry {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  accountName: string;
  budgeted: number;
}

export interface TransferEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  fromAccount: string;
  toAccount: string;
}

export interface BudgetCategory {
  category: string;
  budgeted: number;
  actual: number;
  color: string;
}

// --- Current period: Jan 2026 2H (days 16-31) ---

export const mockCurrentPeriod: CashFlowPeriod = {
  year: 2026,
  month: 1,
  half: '2H',
  startingBalance: 5120.74,
  endingBalance: 4832.41,
  projectedEndingBalance: 4650.00,
  totalIncome: 3295.00,
  projectedIncome: 3295.00,
  totalExpenses: 3583.33,
  projectedExpenses: 3765.74,
  totalTransfers: 500.00,
};

export const mockPreviousPeriod: CashFlowPeriod = {
  year: 2026,
  month: 1,
  half: '1H',
  startingBalance: 4380.91,
  endingBalance: 5120.74,
  projectedEndingBalance: 4900.00,
  totalIncome: 3250.00,
  projectedIncome: 3250.00,
  totalExpenses: 2510.17,
  projectedExpenses: 2730.91,
  totalTransfers: 0,
};

export const mockIncomeEntries: IncomeEntry[] = [
  { id: 'i1', source: 'Payroll Deposit', amount: 3250.00, date: '2026-01-18', accountName: 'Primary Checking', accountLastFour: '4521', isProjected: false },
  { id: 'i2', source: 'Venmo from Mike', amount: 45.00, date: '2026-01-20', accountName: 'Primary Checking', accountLastFour: '4521', isProjected: false },
];

export const mockExpenseEntries: ExpenseEntry[] = [
  { id: 'e1', category: 'Rent', description: 'Rent Payment', amount: 2150.00, date: '2026-01-18', accountName: 'Primary Checking', budgeted: 2150.00 },
  { id: 'e2', category: 'Groceries', description: 'Costco Wholesale', amount: 215.30, date: '2026-01-22', accountName: 'Primary Checking', budgeted: 0 },
  { id: 'e3', category: 'Utilities', description: 'Electric Bill', amount: 128.47, date: '2026-01-24', accountName: 'Primary Checking', budgeted: 150.00 },
  { id: 'e4', category: 'Entertainment', description: 'AMC Theatres', amount: 24.00, date: '2026-01-24', accountName: 'Sapphire Preferred', budgeted: 0 },
  { id: 'e5', category: 'Subscriptions', description: 'Spotify Premium', amount: 15.99, date: '2026-01-26', accountName: 'Sapphire Preferred', budgeted: 15.99 },
  { id: 'e6', category: 'Dining', description: 'Uber Eats', amount: 28.90, date: '2026-01-26', accountName: 'Primary Checking', budgeted: 0 },
  { id: 'e7', category: 'Groceries', description: "Trader Joe's", amount: 58.90, date: '2026-01-27', accountName: 'Primary Checking', budgeted: 0 },
  { id: 'e8', category: 'Shopping', description: 'Amazon.com', amount: 134.56, date: '2026-01-27', accountName: 'Sapphire Preferred', budgeted: 0 },
  { id: 'e9', category: 'Subscriptions', description: 'Netflix Monthly', amount: 22.99, date: '2026-01-29', accountName: 'Sapphire Preferred', budgeted: 22.99 },
  { id: 'e10', category: 'Health', description: 'CVS Pharmacy', amount: 31.44, date: '2026-01-29', accountName: 'Primary Checking', budgeted: 0 },
  { id: 'e11', category: 'Shopping', description: 'Target', amount: 64.21, date: '2026-01-29', accountName: 'Blue Cash Everyday', budgeted: 0 },
  { id: 'e12', category: 'Health', description: 'Gym Membership', amount: 95.00, date: '2026-01-20', accountName: 'Sapphire Preferred', budgeted: 95.00 },
  { id: 'e13', category: 'Dining', description: 'Chipotle', amount: 16.85, date: '2026-01-30', accountName: 'Primary Checking', budgeted: 0 },
  { id: 'e14', category: 'Transportation', description: 'Shell Gas Station', amount: 52.40, date: '2026-01-30', accountName: 'Sapphire Preferred', budgeted: 0 },
  { id: 'e15', category: 'Groceries', description: 'Whole Foods Market', amount: 87.32, date: '2026-01-31', accountName: 'Primary Checking', budgeted: 0 },
  { id: 'e16', category: 'Transportation', description: 'Uber ride', amount: 34.50, date: '2026-01-31', accountName: 'Sapphire Preferred', budgeted: 0 },
];

export const mockTransferEntries: TransferEntry[] = [
  { id: 'tr1', description: 'Transfer to Savings', amount: 500.00, date: '2026-01-28', fromAccount: 'Primary Checking', toAccount: 'High-Yield Savings' },
];

export const mockBudgetCategories: BudgetCategory[] = [
  { category: 'Rent', budgeted: 2150.00, actual: 2150.00, color: 'accent-rose' },
  { category: 'Groceries', budgeted: 400.00, actual: 361.52, color: 'accent-mint' },
  { category: 'Transportation', budgeted: 120.00, actual: 86.90, color: 'accent-sky' },
  { category: 'Dining', budgeted: 100.00, actual: 45.75, color: 'accent-amber' },
  { category: 'Subscriptions', budgeted: 50.00, actual: 38.98, color: 'accent-violet' },
  { category: 'Shopping', budgeted: 150.00, actual: 198.77, color: 'accent-violet' },
  { category: 'Utilities', budgeted: 150.00, actual: 128.47, color: 'accent-amber' },
  { category: 'Health', budgeted: 100.00, actual: 126.44, color: 'accent-rose' },
  { category: 'Entertainment', budgeted: 50.00, actual: 24.00, color: 'accent-rose' },
];

// Historical periods for comparison
export const mockPeriodHistory: CashFlowPeriod[] = [
  { year: 2026, month: 1, half: '2H', startingBalance: 5120.74, endingBalance: 4832.41, projectedEndingBalance: 4650.00, totalIncome: 3295.00, projectedIncome: 3295.00, totalExpenses: 3583.33, projectedExpenses: 3765.74, totalTransfers: 500.00 },
  { year: 2026, month: 1, half: '1H', startingBalance: 4380.91, endingBalance: 5120.74, projectedEndingBalance: 4900.00, totalIncome: 3250.00, projectedIncome: 3250.00, totalExpenses: 2510.17, projectedExpenses: 2730.91, totalTransfers: 0 },
  { year: 2025, month: 12, half: '2H', startingBalance: 3890.22, endingBalance: 4380.91, projectedEndingBalance: 4200.00, totalIncome: 3250.00, projectedIncome: 3250.00, totalExpenses: 2759.31, projectedExpenses: 2940.22, totalTransfers: 0 },
  { year: 2025, month: 12, half: '1H', startingBalance: 4120.55, endingBalance: 3890.22, projectedEndingBalance: 3800.00, totalIncome: 3250.00, projectedIncome: 3250.00, totalExpenses: 3480.33, projectedExpenses: 3570.55, totalTransfers: 0 },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
