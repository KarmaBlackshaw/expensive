import * as db from '@/services/database';
import { Category, PlannedExpense, Transaction } from '@/types/expense';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface ExpenseContextType {
  // Categories
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Planned Expenses
  plannedExpenses: PlannedExpense[];
  addPlannedExpense: (expense: Omit<PlannedExpense, 'id' | 'createdAt' | 'paidAt'>) => Promise<void>;
  updatePlannedExpense: (id: string, updates: Partial<PlannedExpense>) => Promise<void>;
  deletePlannedExpense: (id: string) => Promise<void>;
  togglePlannedExpenseStatus: (id: string) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Totals
  totalPaid: number;
  totalUnpaid: number;
  totalExpenses: number;

  // State
  isLoading: boolean;
  refresh: () => Promise<void>;

  // Helpers
  getCategoryName: (categoryId: string) => string;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getTransactionsGroupedByDate: (transactions: Transaction[]) => Map<string, Transaction[]>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState({ totalPaid: 0, totalUnpaid: 0, totalExpenses: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [cats, planned, trans, newTotals] = await Promise.all([
      db.getCategories(),
      db.getPlannedExpenses(),
      db.getTransactions(),
      db.getTotals(),
    ]);
    setCategories(cats);
    setPlannedExpenses(planned);
    setTransactions(trans);
    setTotals(newTotals);
  }, []);

  useEffect(() => {
    const init = async () => {
      await db.initDatabase();
      await db.checkAndResetMonthly();
      await refresh();
      setIsLoading(false);
    };
    init();
  }, [refresh]);

  // Category operations
  const addCategory = async (name: string) => {
    await db.addCategory(name);
    await refresh();
  };

  const updateCategory = async (id: string, name: string) => {
    await db.updateCategory(id, name);
    await refresh();
  };

  const deleteCategory = async (id: string) => {
    await db.deleteCategory(id);
    await refresh();
  };

  // Planned expense operations
  const addPlannedExpense = async (expense: Omit<PlannedExpense, 'id' | 'createdAt' | 'paidAt'>) => {
    await db.addPlannedExpense(expense);
    await refresh();
  };

  const updatePlannedExpense = async (id: string, updates: Partial<PlannedExpense>) => {
    await db.updatePlannedExpense(id, updates);
    await refresh();
  };

  const deletePlannedExpense = async (id: string) => {
    await db.deletePlannedExpense(id);
    await refresh();
  };

  const togglePlannedExpenseStatus = async (id: string) => {
    await db.togglePlannedExpenseStatus(id);
    await refresh();
  };

  // Transaction operations
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await db.addTransaction(transaction);
    await refresh();
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    await db.updateTransaction(id, updates);
    await refresh();
  };

  const deleteTransaction = async (id: string) => {
    await db.deleteTransaction(id);
    await refresh();
  };

  // Helper functions
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name ?? 'Uncategorized';
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date): Transaction[] => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  };

  const getTransactionsGroupedByDate = (trans: Transaction[]): Map<string, Transaction[]> => {
    const grouped = new Map<string, Transaction[]>();
    trans.forEach(t => {
      const dateKey = t.date.split('T')[0]; // YYYY-MM-DD
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, t]);
    });
    return grouped;
  };

  return (
    <ExpenseContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        plannedExpenses,
        addPlannedExpense,
        updatePlannedExpense,
        deletePlannedExpense,
        togglePlannedExpenseStatus,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        ...totals,
        isLoading,
        refresh,
        getCategoryName,
        getTransactionsByDateRange,
        getTransactionsGroupedByDate,
      }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
