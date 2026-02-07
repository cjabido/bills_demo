export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';

export interface AccountDetail {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  lastFour: string;
  balance: number;
  isActive: boolean;
  isTaxable: boolean;
  lastUpdated: string;
}

export interface AccountGroup {
  type: AccountType;
  label: string;
  isLiability: boolean;
}

export const ACCOUNT_GROUPS: AccountGroup[] = [
  { type: 'checking', label: 'Cash', isLiability: false },
  { type: 'savings', label: 'Savings', isLiability: false },
  { type: 'investment', label: 'Investments', isLiability: false },
  { type: 'credit_card', label: 'Credit Cards', isLiability: true },
  { type: 'loan', label: 'Loans', isLiability: true },
];

export const mockAccountDetails: AccountDetail[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    institution: 'Chase',
    lastFour: '4521',
    balance: 4832.41,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-31',
  },
  {
    id: '2',
    name: 'Direct Deposit',
    type: 'checking',
    institution: 'Chase',
    lastFour: '8810',
    balance: 1205.33,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-31',
  },
  {
    id: '3',
    name: 'High-Yield Savings',
    type: 'savings',
    institution: 'Marcus',
    lastFour: '7833',
    balance: 18250.00,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-30',
  },
  {
    id: '4',
    name: 'Emergency Fund',
    type: 'savings',
    institution: 'Ally',
    lastFour: '2209',
    balance: 10000.00,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-28',
  },
  {
    id: '5',
    name: 'Brokerage',
    type: 'investment',
    institution: 'Fidelity',
    lastFour: '3301',
    balance: 32450.82,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-31',
  },
  {
    id: '6',
    name: '401(k)',
    type: 'investment',
    institution: 'Fidelity',
    lastFour: '6645',
    balance: 67320.15,
    isActive: true,
    isTaxable: false,
    lastUpdated: '2026-01-31',
  },
  {
    id: '7',
    name: 'Roth IRA',
    type: 'investment',
    institution: 'Vanguard',
    lastFour: '1190',
    balance: 24800.00,
    isActive: false,
    isTaxable: false,
    lastUpdated: '2026-01-15',
  },
  {
    id: '8',
    name: 'Sapphire Preferred',
    type: 'credit_card',
    institution: 'Chase',
    lastFour: '9012',
    balance: 1247.63,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-31',
  },
  {
    id: '9',
    name: 'Blue Cash Everyday',
    type: 'credit_card',
    institution: 'Amex',
    lastFour: '5567',
    balance: 432.18,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-29',
  },
  {
    id: '10',
    name: 'Student Loan',
    type: 'loan',
    institution: 'Nelnet',
    lastFour: '0041',
    balance: 12400.00,
    isActive: true,
    isTaxable: true,
    lastUpdated: '2026-01-20',
  },
];
