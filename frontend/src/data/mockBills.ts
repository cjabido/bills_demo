export type BillStatus = 'paid' | 'upcoming' | 'due_soon' | 'overdue';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  category: string; // Real category name from backend
  categoryColor: string; // Hex color from backend, e.g. '#10b981'
  categoryId?: string; // For editing — maps back to API
  accountId?: string; // For editing — maps back to API
  frequency?: string; // For editing — maps back to API
  status: BillStatus;
  isRecurring: boolean;
  paidDate?: string;
  autopay: boolean;
  notes?: string;
}

export const mockBills: Bill[] = [
  { id: '1',  name: 'Rent',            amount: 2150.00, dueDate: '2026-02-01', category: 'Rent',          categoryColor: '#e84393', status: 'due_soon', isRecurring: true, autopay: false },
  { id: '2',  name: 'Electric Bill',   amount: 134.52,  dueDate: '2026-02-03', category: 'Utilities',     categoryColor: '#f59e0b', status: 'upcoming', isRecurring: true, autopay: true },
  { id: '3',  name: 'Car Insurance',   amount: 189.00,  dueDate: '2026-02-05', category: 'Insurance',     categoryColor: '#0284c7', status: 'upcoming', isRecurring: true, autopay: true },
  { id: '4',  name: 'Spotify',         amount: 15.99,   dueDate: '2026-02-07', category: 'Subscriptions', categoryColor: '#7c3aed', status: 'upcoming', isRecurring: true, autopay: true },
  { id: '5',  name: 'AT&T Wireless',   amount: 85.00,   dueDate: '2026-02-10', category: 'Phone',         categoryColor: '#10b981', status: 'upcoming', isRecurring: true, autopay: false },
  { id: '6',  name: 'Xfinity Internet',amount: 79.99,   dueDate: '2026-02-12', category: 'Internet',      categoryColor: '#0284c7', status: 'upcoming', isRecurring: true, autopay: true },
  { id: '7',  name: 'Student Loan',    amount: 350.00,  dueDate: '2026-02-15', category: 'Loans',         categoryColor: '#e84393', status: 'upcoming', isRecurring: true, autopay: true },
  { id: '8',  name: 'Netflix',         amount: 22.99,   dueDate: '2026-02-18', category: 'Subscriptions', categoryColor: '#7c3aed', status: 'upcoming', isRecurring: true, autopay: true },
  { id: '9',  name: 'Water Bill',      amount: 45.30,   dueDate: '2026-01-28', category: 'Utilities',     categoryColor: '#f59e0b', status: 'overdue',  isRecurring: true, autopay: false },
  { id: '10', name: 'Rent',            amount: 2150.00, dueDate: '2026-01-01', category: 'Rent',          categoryColor: '#e84393', status: 'paid', isRecurring: true, autopay: false, paidDate: '2026-01-01' },
  { id: '11', name: 'Electric Bill',   amount: 128.47,  dueDate: '2026-01-03', category: 'Utilities',     categoryColor: '#f59e0b', status: 'paid', isRecurring: true, autopay: true,  paidDate: '2026-01-03' },
  { id: '12', name: 'Car Insurance',   amount: 189.00,  dueDate: '2026-01-05', category: 'Insurance',     categoryColor: '#0284c7', status: 'paid', isRecurring: true, autopay: true,  paidDate: '2026-01-05' },
  { id: '13', name: 'Spotify',         amount: 15.99,   dueDate: '2026-01-07', category: 'Subscriptions', categoryColor: '#7c3aed', status: 'paid', isRecurring: true, autopay: true,  paidDate: '2026-01-07' },
  { id: '14', name: 'AT&T Wireless',   amount: 85.00,   dueDate: '2026-01-10', category: 'Phone',         categoryColor: '#10b981', status: 'paid', isRecurring: true, autopay: false, paidDate: '2026-01-09' },
  { id: '15', name: 'Xfinity Internet',amount: 79.99,   dueDate: '2026-01-12', category: 'Internet',      categoryColor: '#0284c7', status: 'paid', isRecurring: true, autopay: true,  paidDate: '2026-01-12' },
  { id: '16', name: 'Student Loan',    amount: 350.00,  dueDate: '2026-01-15', category: 'Loans',         categoryColor: '#e84393', status: 'paid', isRecurring: true, autopay: true,  paidDate: '2026-01-15' },
];
