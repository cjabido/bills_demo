export type TxCategory =
  | 'groceries' | 'dining' | 'transportation' | 'shopping'
  | 'subscriptions' | 'utilities' | 'income' | 'transfer'
  | 'health' | 'entertainment' | 'rent' | 'insurance'
  | 'loans' | 'internet' | 'phone' | 'investment_contribution'
  | 'other' | 'other_income' | 'freelance' | 'investment' | 'salary';

export interface TxRecord {
  id: string;
  description: string;
  merchant: string;
  amount: number;
  date: string;
  category: TxCategory;
  accountName: string;
  accountLastFour: string;
  notes?: string;
}

export const TX_CATEGORY_CONFIG: Record<TxCategory, { label: string; color: string; bg: string }> = {
  groceries:               { label: 'Groceries',               color: 'text-accent-mint',   bg: 'bg-accent-mint-dim' },
  dining:                  { label: 'Dining',                  color: 'text-accent-amber',  bg: 'bg-accent-amber-dim' },
  transportation:          { label: 'Transportation',          color: 'text-accent-sky',    bg: 'bg-accent-sky-dim' },
  shopping:                { label: 'Shopping',                color: 'text-accent-violet', bg: 'bg-accent-violet-dim' },
  subscriptions:           { label: 'Subscriptions',           color: 'text-accent-violet', bg: 'bg-accent-violet-dim' },
  utilities:               { label: 'Utilities',               color: 'text-accent-amber',  bg: 'bg-accent-amber-dim' },
  income:                  { label: 'Income',                  color: 'text-accent-mint',   bg: 'bg-accent-mint-dim' },
  transfer:                { label: 'Transfer',                color: 'text-accent-sky',    bg: 'bg-accent-sky-dim' },
  health:                  { label: 'Health',                  color: 'text-accent-rose',   bg: 'bg-accent-rose-dim' },
  entertainment:           { label: 'Entertainment',           color: 'text-accent-rose',   bg: 'bg-accent-rose-dim' },
  rent:                    { label: 'Rent',                    color: 'text-accent-rose',   bg: 'bg-accent-rose-dim' },
  insurance:               { label: 'Insurance',               color: 'text-accent-sky',    bg: 'bg-accent-sky-dim' },
  loans:                   { label: 'Loans',                   color: 'text-accent-rose',   bg: 'bg-accent-rose-dim' },
  internet:                { label: 'Internet',                color: 'text-accent-sky',    bg: 'bg-accent-sky-dim' },
  phone:                   { label: 'Phone',                   color: 'text-accent-mint',   bg: 'bg-accent-mint-dim' },
  investment_contribution: { label: 'Investment Contribution', color: 'text-accent-violet', bg: 'bg-accent-violet-dim' },
  other:                   { label: 'Other',                   color: 'text-text-muted',    bg: 'bg-surface-2' },
  salary:                  { label: 'Salary',                  color: 'text-accent-mint',   bg: 'bg-accent-mint-dim' },
  freelance:               { label: 'Freelance',               color: 'text-accent-sky',    bg: 'bg-accent-sky-dim' },
  investment:              { label: 'Investment',              color: 'text-accent-violet', bg: 'bg-accent-violet-dim' },
  other_income:            { label: 'Other Income',            color: 'text-accent-mint',   bg: 'bg-accent-mint-dim' },
};

export const mockTxRecords: TxRecord[] = [
  // Jan 31
  { id: 't1',  description: 'Payroll Deposit',        merchant: 'Employer',         amount:  3250.00, date: '2026-01-31', category: 'income',         accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't2',  description: 'Whole Foods Market',     merchant: 'Whole Foods',      amount:  -87.32,  date: '2026-01-31', category: 'groceries',      accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't3',  description: 'Uber ride to airport',   merchant: 'Uber',             amount:  -34.50,  date: '2026-01-31', category: 'transportation', accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  // Jan 30
  { id: 't4',  description: 'Shell Gas Station',      merchant: 'Shell',            amount:  -52.40,  date: '2026-01-30', category: 'transportation', accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  { id: 't5',  description: 'Chipotle Mexican Grill', merchant: 'Chipotle',         amount:  -16.85,  date: '2026-01-30', category: 'dining',         accountName: 'Primary Checking', accountLastFour: '4521' },
  // Jan 29
  { id: 't6',  description: 'Netflix Monthly',        merchant: 'Netflix',          amount:  -22.99,  date: '2026-01-29', category: 'subscriptions',  accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  { id: 't7',  description: 'CVS Pharmacy',           merchant: 'CVS',              amount:  -31.44,  date: '2026-01-29', category: 'health',         accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't8',  description: 'Target',                 merchant: 'Target',           amount:  -64.21,  date: '2026-01-29', category: 'shopping',       accountName: 'Blue Cash Everyday', accountLastFour: '5567' },
  // Jan 28
  { id: 't9',  description: 'Transfer to Savings',    merchant: 'Internal',         amount: -500.00,  date: '2026-01-28', category: 'transfer',       accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't10', description: 'Savings Deposit',        merchant: 'Internal',         amount:  500.00,  date: '2026-01-28', category: 'transfer',       accountName: 'High-Yield Savings', accountLastFour: '7833' },
  // Jan 27
  { id: 't11', description: 'Amazon.com',             merchant: 'Amazon',           amount: -134.56,  date: '2026-01-27', category: 'shopping',       accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  { id: 't12', description: 'Trader Joe\'s',          merchant: 'Trader Joe\'s',    amount:  -58.90,  date: '2026-01-27', category: 'groceries',      accountName: 'Primary Checking', accountLastFour: '4521' },
  // Jan 26
  { id: 't13', description: 'Uber Eats - Sushi Roku', merchant: 'Uber Eats',       amount:  -28.90,  date: '2026-01-26', category: 'dining',         accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't14', description: 'Spotify Premium',        merchant: 'Spotify',          amount:  -15.99,  date: '2026-01-26', category: 'subscriptions',  accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  // Jan 24
  { id: 't15', description: 'Electric Bill',          merchant: 'ConEdison',        amount: -128.47,  date: '2026-01-24', category: 'utilities',      accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't16', description: 'AMC Theatres',           merchant: 'AMC',              amount:  -24.00,  date: '2026-01-24', category: 'entertainment',  accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  // Jan 22
  { id: 't17', description: 'Costco Wholesale',       merchant: 'Costco',           amount: -215.30,  date: '2026-01-22', category: 'groceries',      accountName: 'Primary Checking', accountLastFour: '4521' },
  // Jan 20
  { id: 't18', description: 'Gym Membership',         merchant: 'Equinox',          amount:  -95.00,  date: '2026-01-20', category: 'health',         accountName: 'Sapphire Preferred', accountLastFour: '9012' },
  { id: 't19', description: 'Venmo from Mike',        merchant: 'Venmo',            amount:   45.00,  date: '2026-01-20', category: 'income',         accountName: 'Primary Checking', accountLastFour: '4521' },
  // Jan 18
  { id: 't20', description: 'Payroll Deposit',        merchant: 'Employer',         amount: 3250.00,  date: '2026-01-18', category: 'income',         accountName: 'Primary Checking', accountLastFour: '4521' },
  { id: 't21', description: 'Rent Payment',           merchant: 'Landlord',         amount: -2150.00, date: '2026-01-18', category: 'rent',           accountName: 'Primary Checking', accountLastFour: '4521' },
];
