import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Default categories ─────────────────────────────────────────

const defaultCategories = [
  { name: 'Groceries',               type: 'expense' as const, color: '#10b981', icon: 'ShoppingBag',  sortOrder: 1 },
  { name: 'Dining',                  type: 'expense' as const, color: '#f59e0b', icon: 'Utensils',     sortOrder: 2 },
  { name: 'Transportation',          type: 'expense' as const, color: '#0284c7', icon: 'Car',          sortOrder: 3 },
  { name: 'Shopping',                type: 'expense' as const, color: '#7c3aed', icon: 'Tag',          sortOrder: 4 },
  { name: 'Subscriptions',           type: 'expense' as const, color: '#7c3aed', icon: 'Tv',           sortOrder: 5 },
  { name: 'Utilities',               type: 'expense' as const, color: '#f59e0b', icon: 'Zap',          sortOrder: 6 },
  { name: 'Rent',                    type: 'expense' as const, color: '#e84393', icon: 'Home',         sortOrder: 7 },
  { name: 'Insurance',               type: 'expense' as const, color: '#0284c7', icon: 'ShieldCheck',  sortOrder: 8 },
  { name: 'Loans',                   type: 'expense' as const, color: '#e84393', icon: 'DollarSign',   sortOrder: 9 },
  { name: 'Internet',                type: 'expense' as const, color: '#0284c7', icon: 'Wifi',         sortOrder: 10 },
  { name: 'Phone',                   type: 'expense' as const, color: '#10b981', icon: 'Smartphone',   sortOrder: 11 },
  { name: 'Health',                  type: 'expense' as const, color: '#e84393', icon: 'Heart',        sortOrder: 12 },
  { name: 'Entertainment',           type: 'expense' as const, color: '#e84393', icon: 'Activity',     sortOrder: 13 },
  { name: 'Other',                   type: 'expense' as const, color: '#8a8aa0', icon: 'Tag',          sortOrder: 14 },
  { name: 'Investment Contribution', type: 'expense' as const, color: '#7c3aed', icon: 'TrendingUp',   sortOrder: 15 },
  { name: 'Salary',                  type: 'income'  as const, color: '#10b981', icon: 'DollarSign',   sortOrder: 1 },
  { name: 'Freelance',               type: 'income'  as const, color: '#0284c7', icon: 'Briefcase',    sortOrder: 2 },
  { name: 'Investment',              type: 'income'  as const, color: '#7c3aed', icon: 'TrendingUp',   sortOrder: 3 },
  { name: 'Transfer',                type: 'income'  as const, color: '#0284c7', icon: 'Repeat',       sortOrder: 4 },
  { name: 'Other Income',            type: 'income'  as const, color: '#8a8aa0', icon: 'DollarSign',   sortOrder: 5 },
];

// ── Mock accounts ──────────────────────────────────────────────

const mockAccounts = [
  { name: 'Primary Checking',   type: 'checking'    as const, institution: 'Chase',    lastFour: '4521', balance: 4832.41,  isActive: true,  isTaxable: true },
  { name: 'Direct Deposit',     type: 'checking'    as const, institution: 'Chase',    lastFour: '8810', balance: 1205.33,  isActive: true,  isTaxable: true },
  { name: 'High-Yield Savings', type: 'savings'     as const, institution: 'Marcus',   lastFour: '7833', balance: 18250.00, isActive: true,  isTaxable: true },
  { name: 'Emergency Fund',     type: 'savings'     as const, institution: 'Ally',     lastFour: '2209', balance: 10000.00, isActive: true,  isTaxable: true },
  { name: 'Brokerage',          type: 'investment'  as const, institution: 'Fidelity', lastFour: '3301', balance: 32450.82, isActive: true,  isTaxable: true },
  { name: '401(k)',              type: 'investment'  as const, institution: 'Fidelity', lastFour: '6645', balance: 67320.15, isActive: true,  isTaxable: false },
  { name: 'Roth IRA',           type: 'investment'  as const, institution: 'Vanguard', lastFour: '1190', balance: 24800.00, isActive: false, isTaxable: false },
  { name: 'Sapphire Preferred', type: 'credit_card' as const, institution: 'Chase',    lastFour: '9012', balance: 1247.63,  isActive: true,  isTaxable: true },
  { name: 'Blue Cash Everyday', type: 'credit_card' as const, institution: 'Amex',     lastFour: '5567', balance: 432.18,   isActive: true,  isTaxable: true },
  { name: 'Student Loan',       type: 'loan'        as const, institution: 'Nelnet',   lastFour: '0041', balance: 12400.00, isActive: true,  isTaxable: true },
];

// ── Transactions ───────────────────────────────────────────────

const mockTransactions = [
  { description: 'Payroll Deposit',        merchant: 'Employer',    amount:  3250.00, date: '2026-01-31', categoryName: 'Salary',         accountName: 'Primary Checking' },
  { description: 'Whole Foods Market',     merchant: 'Whole Foods', amount:  -87.32,  date: '2026-01-31', categoryName: 'Groceries',      accountName: 'Primary Checking' },
  { description: 'Uber ride to airport',   merchant: 'Uber',        amount:  -34.50,  date: '2026-01-31', categoryName: 'Transportation', accountName: 'Sapphire Preferred' },
  { description: 'Shell Gas Station',      merchant: 'Shell',       amount:  -52.40,  date: '2026-01-30', categoryName: 'Transportation', accountName: 'Sapphire Preferred' },
  { description: 'Chipotle Mexican Grill', merchant: 'Chipotle',    amount:  -16.85,  date: '2026-01-30', categoryName: 'Dining',         accountName: 'Primary Checking' },
  { description: 'Netflix Monthly',        merchant: 'Netflix',     amount:  -22.99,  date: '2026-01-29', categoryName: 'Subscriptions',  accountName: 'Sapphire Preferred' },
  { description: 'CVS Pharmacy',           merchant: 'CVS',         amount:  -31.44,  date: '2026-01-29', categoryName: 'Health',         accountName: 'Primary Checking' },
  { description: 'Target',                 merchant: 'Target',      amount:  -64.21,  date: '2026-01-29', categoryName: 'Shopping',       accountName: 'Blue Cash Everyday' },
  { description: 'Transfer to Savings',    merchant: 'Internal',    amount: -500.00,  date: '2026-01-28', categoryName: 'Transfer',       accountName: 'Primary Checking' },
  { description: 'Savings Deposit',        merchant: 'Internal',    amount:  500.00,  date: '2026-01-28', categoryName: 'Transfer',       accountName: 'High-Yield Savings' },
  { description: 'Amazon.com',             merchant: 'Amazon',      amount: -134.56,  date: '2026-01-27', categoryName: 'Shopping',       accountName: 'Sapphire Preferred' },
  { description: "Trader Joe's",           merchant: "Trader Joe's",amount:  -58.90,  date: '2026-01-27', categoryName: 'Groceries',      accountName: 'Primary Checking' },
  { description: 'Uber Eats - Sushi Roku', merchant: 'Uber Eats',   amount:  -28.90,  date: '2026-01-26', categoryName: 'Dining',         accountName: 'Primary Checking' },
  { description: 'Spotify Premium',        merchant: 'Spotify',     amount:  -15.99,  date: '2026-01-26', categoryName: 'Subscriptions',  accountName: 'Sapphire Preferred' },
  { description: 'Electric Bill',          merchant: 'ConEdison',   amount: -128.47,  date: '2026-01-24', categoryName: 'Utilities',      accountName: 'Primary Checking' },
  { description: 'AMC Theatres',           merchant: 'AMC',         amount:  -24.00,  date: '2026-01-24', categoryName: 'Entertainment',  accountName: 'Sapphire Preferred' },
  { description: 'Costco Wholesale',       merchant: 'Costco',      amount: -215.30,  date: '2026-01-22', categoryName: 'Groceries',      accountName: 'Primary Checking' },
  { description: 'Gym Membership',         merchant: 'Equinox',     amount:  -95.00,  date: '2026-01-20', categoryName: 'Health',         accountName: 'Sapphire Preferred' },
  { description: 'Venmo from Mike',        merchant: 'Venmo',       amount:   45.00,  date: '2026-01-20', categoryName: 'Other Income',   accountName: 'Primary Checking' },
  { description: 'Payroll Deposit',        merchant: 'Employer',    amount: 3250.00,  date: '2026-01-18', categoryName: 'Salary',         accountName: 'Primary Checking' },
  { description: 'Rent Payment',           merchant: 'Landlord',    amount: -2150.00, date: '2026-01-18', categoryName: 'Rent',           accountName: 'Primary Checking' },
];

// ── Recurring templates ────────────────────────────────────────

const mockTemplates = [
  { name: 'Rent',             amount: -2150.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-01', categoryName: 'Rent',          accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: false },
  { name: 'Electric Bill',    amount:  -134.52, frequency: 'monthly'      as const, nextDueDate: '2026-02-03', categoryName: 'Utilities',     accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: true },
  { name: 'Car Insurance',    amount:  -189.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-05', categoryName: 'Insurance',     accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: true },
  { name: 'Spotify',          amount:   -15.99, frequency: 'monthly'      as const, nextDueDate: '2026-02-07', categoryName: 'Subscriptions', accountName: 'Sapphire Preferred', templateType: 'bill' as const, isAutopay: true },
  { name: 'AT&T Wireless',    amount:   -85.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-10', categoryName: 'Phone',         accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: false },
  { name: 'Xfinity Internet', amount:   -79.99, frequency: 'monthly'      as const, nextDueDate: '2026-02-12', categoryName: 'Internet',      accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: true },
  { name: 'Student Loan',     amount:  -350.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-15', categoryName: 'Loans',         accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: true },
  { name: 'Netflix',          amount:   -22.99, frequency: 'monthly'      as const, nextDueDate: '2026-02-18', categoryName: 'Subscriptions', accountName: 'Sapphire Preferred', templateType: 'bill' as const, isAutopay: true },
  { name: 'Water Bill',       amount:   -45.30, frequency: 'monthly'      as const, nextDueDate: '2026-02-28', categoryName: 'Utilities',     accountName: 'Primary Checking',   templateType: 'bill' as const, isAutopay: false },
  { name: 'Gym Membership',   amount:   -95.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-20', categoryName: 'Health',        accountName: 'Sapphire Preferred', templateType: 'bill' as const, isAutopay: true },
  { name: 'Payroll',          amount:  3250.00, frequency: 'semi_monthly' as const, nextDueDate: '2026-02-01', categoryName: 'Salary',        accountName: 'Primary Checking',   templateType: 'income' as const, isAutopay: false },
  { name: 'Freelance Work',   amount:   800.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-15', categoryName: 'Freelance',     accountName: 'Primary Checking',   templateType: 'income' as const, isAutopay: false },
  { name: '401(k) Contribution', amount: -500.00, frequency: 'semi_monthly' as const, nextDueDate: '2026-02-01', categoryName: 'Investment Contribution', accountName: '401(k)',   templateType: 'investment' as const, isAutopay: true },
  { name: 'Roth IRA',            amount: -250.00, frequency: 'monthly'      as const, nextDueDate: '2026-02-15', categoryName: 'Investment Contribution', accountName: 'Roth IRA', templateType: 'investment' as const, isAutopay: true },
];

// ── Periods & budgets ──────────────────────────────────────────

const mockPeriods = [
  { year: 2026, month: 1, half: 2, startingBalance: 5120.74, projectedIncome: 3295.00, projectedExpenses: 3765.74 },
  { year: 2026, month: 1, half: 1, startingBalance: 4380.91, projectedIncome: 3250.00, projectedExpenses: 2730.91 },
  { year: 2025, month: 12, half: 2, startingBalance: 3890.22, projectedIncome: 3250.00, projectedExpenses: 2940.22 },
  { year: 2025, month: 12, half: 1, startingBalance: 4120.55, projectedIncome: 3250.00, projectedExpenses: 3570.55 },
];

const mockBudgets = [
  { categoryName: 'Rent',          budgeted: 2150.00 },
  { categoryName: 'Groceries',     budgeted: 400.00 },
  { categoryName: 'Transportation',budgeted: 120.00 },
  { categoryName: 'Dining',        budgeted: 100.00 },
  { categoryName: 'Subscriptions', budgeted: 50.00 },
  { categoryName: 'Shopping',      budgeted: 150.00 },
  { categoryName: 'Utilities',     budgeted: 150.00 },
  { categoryName: 'Health',        budgeted: 100.00 },
  { categoryName: 'Entertainment', budgeted: 50.00 },
];

// ── Asset snapshots ────────────────────────────────────────────

const assetGrowthMultipliers = [
  0.76, 0.78, 0.75, 0.79, 0.81, 0.83, 0.82, 0.85, 0.87, 0.86, 0.90, 1.00,
];

const investmentAccounts = [
  { name: '401(k)',              baseBalance: 67320.15, baseCost: 52400.00 },
  { name: 'Roth IRA',           baseBalance: 24800.00, baseCost: 19500.00 },
  { name: 'Brokerage',          baseBalance: 32450.82, baseCost: 26800.00 },
  { name: 'High-Yield Savings', baseBalance: 18250.00, baseCost: 18250.00 },
  { name: 'Emergency Fund',     baseBalance: 10000.00, baseCost: 10000.00 },
  { name: 'Primary Checking',   baseBalance: 4832.41,  baseCost: 4832.41 },
];

const snapshotDates = [
  '2025-02-28', '2025-03-31', '2025-04-30', '2025-05-31',
  '2025-06-30', '2025-07-31', '2025-08-31', '2025-09-30',
  '2025-10-31', '2025-11-30', '2025-12-31', '2026-01-31',
];

// ── Seed function (exported for programmatic reset) ────────────

export async function seed() {
  // 1. Clear all data (respect FK order)
  await prisma.budget.deleteMany();
  await prisma.period.deleteMany();
  await prisma.assetSnapshot.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringTemplate.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();

  // 2. Categories
  await prisma.category.createMany({
    data: defaultCategories.map(cat => ({
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      isDefault: true,
      sortOrder: cat.sortOrder,
    })),
  });
  console.log(`Seeded ${defaultCategories.length} categories.`);

  const allCategories = await prisma.category.findMany();
  const categoryByName = new Map(allCategories.map(c => [c.name, c]));

  // 3. Accounts
  await prisma.account.createMany({
    data: mockAccounts.map(a => ({
      name: a.name,
      type: a.type,
      institution: a.institution,
      lastFour: a.lastFour,
      balance: a.balance,
      isActive: a.isActive,
      isTaxable: a.isTaxable,
    })),
  });
  console.log(`Seeded ${mockAccounts.length} accounts.`);

  const allAccounts = await prisma.account.findMany();
  const accountByName = new Map(allAccounts.map(a => [a.name, a]));

  // 4. Recurring templates
  for (const t of mockTemplates) {
    const category = categoryByName.get(t.categoryName);
    const account = accountByName.get(t.accountName);
    if (!category || !account) {
      console.warn(`Skipping template "${t.name}": missing category or account`);
      continue;
    }
    await prisma.recurringTemplate.create({
      data: {
        name: t.name,
        amount: t.amount,
        frequency: t.frequency,
        nextDueDate: new Date(t.nextDueDate),
        categoryId: category.id,
        accountId: account.id,
        templateType: t.templateType,
        isAutopay: t.isAutopay,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${mockTemplates.length} recurring templates.`);

  // 5. Transactions
  for (const tx of mockTransactions) {
    const category = categoryByName.get(tx.categoryName);
    const account = accountByName.get(tx.accountName);
    if (!category || !account) {
      console.warn(`Skipping tx "${tx.description}": missing category or account`);
      continue;
    }
    await prisma.transaction.create({
      data: {
        description: tx.description,
        merchant: tx.merchant,
        amount: tx.amount,
        date: new Date(tx.date),
        categoryId: category.id,
        accountId: account.id,
      },
    });
  }
  console.log(`Seeded ${mockTransactions.length} transactions.`);

  // 6. Periods
  for (const p of mockPeriods) {
    await prisma.period.create({
      data: {
        year: p.year,
        month: p.month,
        half: p.half,
        startingBalance: p.startingBalance,
        projectedIncome: p.projectedIncome,
        projectedExpenses: p.projectedExpenses,
      },
    });
  }
  console.log(`Seeded ${mockPeriods.length} periods.`);

  // 7. Budgets (same budget categories for each period)
  const allPeriods = await prisma.period.findMany();
  for (const period of allPeriods) {
    for (const b of mockBudgets) {
      const category = categoryByName.get(b.categoryName);
      if (!category) continue;
      await prisma.budget.create({
        data: {
          periodId: period.id,
          categoryId: category.id,
          budgetedAmount: b.budgeted,
        },
      });
    }
  }
  console.log(`Seeded budgets for ${allPeriods.length} periods.`);

  // 8. Asset snapshots (12 months of monthly snapshots)
  let snapshotCount = 0;
  for (const ia of investmentAccounts) {
    const account = accountByName.get(ia.name);
    if (!account) continue;
    for (let i = 0; i < snapshotDates.length; i++) {
      const multiplier = assetGrowthMultipliers[i];
      await prisma.assetSnapshot.create({
        data: {
          accountId: account.id,
          date: new Date(snapshotDates[i]),
          balance: Math.round(ia.baseBalance * multiplier * 100) / 100,
          costBasis: Math.round(ia.baseCost * (0.85 + i * 0.015 / 11) * 100) / 100,
        },
      });
      snapshotCount++;
    }
  }
  console.log(`Seeded ${snapshotCount} asset snapshots.`);

  console.log('Seed complete!');
}
