export type AssetCategory = 'retirement' | 'taxable' | 'cash' | 'other';

export type InvestmentType = '401k' | 'roth_ira' | 'trad_ira' | 'brokerage' | 'hsa' | 'savings' | 'checking' | 'crypto';

export interface AssetAccount {
  id: string;
  name: string;
  institution: string;
  lastFour: string;
  category: AssetCategory;
  investmentType: InvestmentType;
  balance: number;
  costBasis: number;
  lastUpdated: string;
}

export interface PortfolioSnapshot {
  id: string;
  date: string;
  totalValue: number;
  retirement: number;
  taxable: number;
  cash: number;
}

export interface GrowthPoint {
  date: string;
  label: string;
  value: number;
}

export const ASSET_CATEGORY_CONFIG: Record<AssetCategory, { label: string; color: string; bg: string; accent: string }> = {
  retirement: { label: 'Retirement', color: 'text-accent-violet', bg: 'bg-accent-violet-dim', accent: 'accent-violet' },
  taxable: { label: 'Taxable', color: 'text-accent-sky', bg: 'bg-accent-sky-dim', accent: 'accent-sky' },
  cash: { label: 'Cash', color: 'text-accent-mint', bg: 'bg-accent-mint-dim', accent: 'accent-mint' },
  other: { label: 'Other', color: 'text-accent-amber', bg: 'bg-accent-amber-dim', accent: 'accent-amber' },
};

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  '401k': '401(k)',
  roth_ira: 'Roth IRA',
  trad_ira: 'Traditional IRA',
  brokerage: 'Brokerage',
  hsa: 'HSA',
  savings: 'Savings',
  checking: 'Checking',
  crypto: 'Crypto',
};

export const mockAssetAccounts: AssetAccount[] = [
  {
    id: 'a1',
    name: '401(k)',
    institution: 'Fidelity',
    lastFour: '6645',
    category: 'retirement',
    investmentType: '401k',
    balance: 67320.15,
    costBasis: 52400.00,
    lastUpdated: '2026-01-31',
  },
  {
    id: 'a2',
    name: 'Roth IRA',
    institution: 'Vanguard',
    lastFour: '1190',
    category: 'retirement',
    investmentType: 'roth_ira',
    balance: 24800.00,
    costBasis: 19500.00,
    lastUpdated: '2026-01-31',
  },
  {
    id: 'a3',
    name: 'Traditional IRA',
    institution: 'Fidelity',
    lastFour: '3388',
    category: 'retirement',
    investmentType: 'trad_ira',
    balance: 15640.00,
    costBasis: 12000.00,
    lastUpdated: '2026-01-28',
  },
  {
    id: 'a4',
    name: 'Brokerage',
    institution: 'Fidelity',
    lastFour: '3301',
    category: 'taxable',
    investmentType: 'brokerage',
    balance: 32450.82,
    costBasis: 26800.00,
    lastUpdated: '2026-01-31',
  },
  {
    id: 'a5',
    name: 'Crypto Portfolio',
    institution: 'Coinbase',
    lastFour: '7721',
    category: 'taxable',
    investmentType: 'crypto',
    balance: 4820.50,
    costBasis: 6200.00,
    lastUpdated: '2026-01-31',
  },
  {
    id: 'a6',
    name: 'HSA',
    institution: 'Fidelity',
    lastFour: '4410',
    category: 'other',
    investmentType: 'hsa',
    balance: 8750.00,
    costBasis: 7200.00,
    lastUpdated: '2026-01-30',
  },
  {
    id: 'a7',
    name: 'High-Yield Savings',
    institution: 'Marcus',
    lastFour: '7833',
    category: 'cash',
    investmentType: 'savings',
    balance: 18250.00,
    costBasis: 18250.00,
    lastUpdated: '2026-01-30',
  },
  {
    id: 'a8',
    name: 'Primary Checking',
    institution: 'Chase',
    lastFour: '4521',
    category: 'cash',
    investmentType: 'checking',
    balance: 4832.41,
    costBasis: 4832.41,
    lastUpdated: '2026-01-31',
  },
  {
    id: 'a9',
    name: 'Emergency Fund',
    institution: 'Ally',
    lastFour: '2209',
    category: 'cash',
    investmentType: 'savings',
    balance: 10000.00,
    costBasis: 10000.00,
    lastUpdated: '2026-01-28',
  },
];

// 12-month growth data for the chart
export const mockGrowthData: GrowthPoint[] = [
  { date: '2025-02-01', label: 'Feb', value: 142800 },
  { date: '2025-03-01', label: 'Mar', value: 145200 },
  { date: '2025-04-01', label: 'Apr', value: 139600 },
  { date: '2025-05-01', label: 'May', value: 148100 },
  { date: '2025-06-01', label: 'Jun', value: 151400 },
  { date: '2025-07-01', label: 'Jul', value: 155800 },
  { date: '2025-08-01', label: 'Aug', value: 153200 },
  { date: '2025-09-01', label: 'Sep', value: 158900 },
  { date: '2025-10-01', label: 'Oct', value: 162400 },
  { date: '2025-11-01', label: 'Nov', value: 160100 },
  { date: '2025-12-01', label: 'Dec', value: 168500 },
  { date: '2026-01-01', label: 'Jan', value: 186863 },
];

// Historical snapshots
export const mockSnapshots: PortfolioSnapshot[] = [
  { id: 's1', date: '2026-01-31', totalValue: 186863.88, retirement: 107760.15, taxable: 37271.32, cash: 33082.41 },
  { id: 's2', date: '2025-12-31', totalValue: 168500.00, retirement: 98200.00, taxable: 34800.00, cash: 35500.00 },
  { id: 's3', date: '2025-11-30', totalValue: 160100.00, retirement: 94600.00, taxable: 32100.00, cash: 33400.00 },
  { id: 's4', date: '2025-10-31', totalValue: 162400.00, retirement: 96100.00, taxable: 33500.00, cash: 32800.00 },
  { id: 's5', date: '2025-09-30', totalValue: 158900.00, retirement: 93800.00, taxable: 31600.00, cash: 33500.00 },
  { id: 's6', date: '2025-08-31', totalValue: 153200.00, retirement: 90400.00, taxable: 30200.00, cash: 32600.00 },
  { id: 's7', date: '2025-07-31', totalValue: 155800.00, retirement: 92100.00, taxable: 31400.00, cash: 32300.00 },
  { id: 's8', date: '2025-06-30', totalValue: 151400.00, retirement: 89200.00, taxable: 30800.00, cash: 31400.00 },
  { id: 's9', date: '2025-05-31', totalValue: 148100.00, retirement: 87400.00, taxable: 29600.00, cash: 31100.00 },
  { id: 's10', date: '2025-04-30', totalValue: 139600.00, retirement: 81200.00, taxable: 27500.00, cash: 30900.00 },
  { id: 's11', date: '2025-03-31', totalValue: 145200.00, retirement: 85800.00, taxable: 28400.00, cash: 31000.00 },
  { id: 's12', date: '2025-02-28', totalValue: 142800.00, retirement: 84100.00, taxable: 27900.00, cash: 30800.00 },
];
