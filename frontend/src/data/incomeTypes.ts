export type IncomeStatus = 'received' | 'expected' | 'overdue';

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  expectedDate: string;
  category: string;
  categoryColor: string;
  categoryId?: string;
  accountId?: string;
  frequency?: string;
  status: IncomeStatus;
  isRecurring: boolean;
  receivedDate?: string;
  notes?: string;
}
