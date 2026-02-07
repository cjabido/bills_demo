export interface MonthlySummary {
  month: string; // 'YYYY-MM'
  label: string; // 'Jan 2026'
  income: number;
  expenses: number;
  net: number;
  savingsRate: number; // percentage
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string; // CSS variable name
  transactions: number;
}

export interface TopMerchant {
  name: string;
  amount: number;
  transactions: number;
  category: string;
}

export interface NetWorthPoint {
  month: string; // 'YYYY-MM'
  label: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

// 12 months of summary data (Feb 2025 – Jan 2026)
export const mockMonthlySummaries: MonthlySummary[] = [
  { month: '2025-02', label: 'Feb 2025', income: 6500, expenses: 4210, net: 2290, savingsRate: 35.2 },
  { month: '2025-03', label: 'Mar 2025', income: 6500, expenses: 4680, net: 1820, savingsRate: 28.0 },
  { month: '2025-04', label: 'Apr 2025', income: 6750, expenses: 4320, net: 2430, savingsRate: 36.0 },
  { month: '2025-05', label: 'May 2025', income: 6500, expenses: 5100, net: 1400, savingsRate: 21.5 },
  { month: '2025-06', label: 'Jun 2025', income: 6500, expenses: 4450, net: 2050, savingsRate: 31.5 },
  { month: '2025-07', label: 'Jul 2025', income: 7200, expenses: 4890, net: 2310, savingsRate: 32.1 },
  { month: '2025-08', label: 'Aug 2025', income: 6500, expenses: 4750, net: 1750, savingsRate: 26.9 },
  { month: '2025-09', label: 'Sep 2025', income: 6500, expenses: 4380, net: 2120, savingsRate: 32.6 },
  { month: '2025-10', label: 'Oct 2025', income: 6500, expenses: 5020, net: 1480, savingsRate: 22.8 },
  { month: '2025-11', label: 'Nov 2025', income: 6500, expenses: 4560, net: 1940, savingsRate: 29.8 },
  { month: '2025-12', label: 'Dec 2025', income: 7000, expenses: 5890, net: 1110, savingsRate: 15.9 },
  { month: '2026-01', label: 'Jan 2026', income: 6545, expenses: 4093, net: 2452, savingsRate: 37.5 },
];

// Spending by category for the selected date range
export const mockCategorySpending: CategorySpending[] = [
  { category: 'Rent', amount: 25800, percentage: 31.2, color: 'accent-rose', transactions: 12 },
  { category: 'Groceries', amount: 9840, percentage: 11.9, color: 'accent-mint', transactions: 96 },
  { category: 'Transportation', amount: 5420, percentage: 6.6, color: 'accent-amber', transactions: 72 },
  { category: 'Dining', amount: 4680, percentage: 5.7, color: 'accent-sky', transactions: 84 },
  { category: 'Shopping', amount: 7320, percentage: 8.9, color: 'accent-violet', transactions: 45 },
  { category: 'Subscriptions', amount: 2280, percentage: 2.8, color: 'accent-violet', transactions: 36 },
  { category: 'Utilities', amount: 3960, percentage: 4.8, color: 'accent-amber', transactions: 24 },
  { category: 'Health', amount: 3120, percentage: 3.8, color: 'accent-rose', transactions: 18 },
  { category: 'Entertainment', amount: 2840, percentage: 3.4, color: 'accent-sky', transactions: 30 },
  { category: 'Insurance', amount: 4560, percentage: 5.5, color: 'accent-mint', transactions: 12 },
  { category: 'Other', amount: 12930, percentage: 15.6, color: 'accent-sky', transactions: 55 },
];

// Top merchants
export const mockTopMerchants: TopMerchant[] = [
  { name: 'Landlord (Rent)', amount: 25800, transactions: 12, category: 'Rent' },
  { name: 'Costco Wholesale', amount: 4320, transactions: 24, category: 'Groceries' },
  { name: 'Amazon.com', amount: 3890, transactions: 32, category: 'Shopping' },
  { name: 'Shell Gas Station', amount: 2640, transactions: 48, category: 'Transportation' },
  { name: 'Whole Foods Market', amount: 2520, transactions: 18, category: 'Groceries' },
  { name: "Trader Joe's", amount: 2100, transactions: 36, category: 'Groceries' },
  { name: 'Uber Eats', amount: 1890, transactions: 28, category: 'Dining' },
  { name: 'Target', amount: 1740, transactions: 14, category: 'Shopping' },
  { name: 'Chipotle', amount: 1380, transactions: 42, category: 'Dining' },
  { name: 'CVS Pharmacy', amount: 1260, transactions: 16, category: 'Health' },
  { name: 'Netflix', amount: 275.88, transactions: 12, category: 'Subscriptions' },
  { name: 'Spotify', amount: 191.88, transactions: 12, category: 'Subscriptions' },
];

// Net worth over time (12 months)
export const mockNetWorthHistory: NetWorthPoint[] = [
  { month: '2025-02', label: 'Feb', assets: 67200, liabilities: 19000, netWorth: 48200 },
  { month: '2025-03', label: 'Mar', assets: 68100, liabilities: 18800, netWorth: 49300 },
  { month: '2025-04', label: 'Apr', assets: 69400, liabilities: 18500, netWorth: 50900 },
  { month: '2025-05', label: 'May', assets: 69800, liabilities: 18700, netWorth: 51100 },
  { month: '2025-06', label: 'Jun', assets: 70500, liabilities: 19200, netWorth: 51300 },
  { month: '2025-07', label: 'Jul', assets: 71800, liabilities: 18900, netWorth: 52900 },
  { month: '2025-08', label: 'Aug', assets: 72300, liabilities: 18600, netWorth: 53700 },
  { month: '2025-09', label: 'Sep', assets: 72900, liabilities: 18400, netWorth: 54500 },
  { month: '2025-10', label: 'Oct', assets: 73200, liabilities: 18800, netWorth: 54400 },
  { month: '2025-11', label: 'Nov', assets: 73800, liabilities: 18500, netWorth: 55300 },
  { month: '2025-12', label: 'Dec', assets: 74500, liabilities: 18300, netWorth: 56200 },
  { month: '2026-01', label: 'Jan', assets: 75533, liabilities: 18248, netWorth: 57285 },
];

export type ReportType = 'overview' | 'spending' | 'income' | 'budget' | 'networth';
export type DateRange = 'this_month' | 'last_3' | 'last_6' | 'this_year' | 'custom';

export const REPORT_TYPE_OPTIONS: { key: ReportType; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'spending', label: 'Spending' },
  { key: 'income', label: 'Income' },
  { key: 'budget', label: 'Budget' },
  { key: 'networth', label: 'Net Worth' },
];

export const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_3', label: 'Last 3 Months' },
  { key: 'last_6', label: 'Last 6 Months' },
  { key: 'this_year', label: 'This Year' },
];
