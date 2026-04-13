export type ExpenseStatus = 'paid' | 'unpaid';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly' | 'none';

export interface Category {
  id: string;
  name: string;
}

export interface PlannedExpense {
  id: string;
  name: string;
  dueDay: number; // 1-31 for monthly, 1-7 for weekly (day of week)
  dueMonth?: number; // 1-12, only for yearly recurrence
  amount: number;
  categoryId: string;
  payableThrough: string;
  status: ExpenseStatus;
  recurrence: RecurrenceFrequency;
  createdAt: string;
  paidAt?: string;
}

export interface Transaction {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  date: string; // ISO date string
  note?: string;
}

export interface MonthlyReset {
  lastResetMonth: number; // 1-12
  lastResetYear: number;
}

// Legacy type aliases for migration
export type RecurringExpense = PlannedExpense;
export type CostRecord = Transaction;
