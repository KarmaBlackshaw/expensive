export type ExpenseStatus = 'paid' | 'unpaid';

export interface RecurringExpense {
  id: string;
  name: string;
  dueDay: number; // 1-31
  amount: number;
  payableThrough: string;
  status: ExpenseStatus;
}

export interface CostRecord {
  id: string;
  name: string;
  category: string;
  cost: number;
  createdAt: string;
}

export interface ExpenseState {
  recurringExpenses: RecurringExpense[];
  costRecords: CostRecord[];
}
