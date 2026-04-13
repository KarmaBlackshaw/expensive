import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { RecurringExpense, CostRecord } from '@/types/expense';
import * as db from '@/services/database';

interface ExpenseContextType {
  recurringExpenses: RecurringExpense[];
  costRecords: CostRecord[];
  isLoading: boolean;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => Promise<void>;
  updateRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  addCostRecord: (record: Omit<CostRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteCostRecord: (id: string) => Promise<void>;
  toggleExpenseStatus: (id: string) => Promise<void>;
  totalPaid: number;
  totalUnpaid: number;
  totalCosts: number;
  refresh: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [costRecords, setCostRecords] = useState<CostRecord[]>([]);
  const [totals, setTotals] = useState({ totalPaid: 0, totalUnpaid: 0, totalCosts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [expenses, records, newTotals] = await Promise.all([
      db.getRecurringExpenses(),
      db.getCostRecords(),
      db.getTotals(),
    ]);
    setRecurringExpenses(expenses);
    setCostRecords(records);
    setTotals(newTotals);
  }, []);

  useEffect(() => {
    const init = async () => {
      await db.initDatabase();
      await refresh();
      setIsLoading(false);
    };
    init();
  }, [refresh]);

  const addRecurringExpense = async (expense: Omit<RecurringExpense, 'id'>) => {
    await db.addRecurringExpense(expense);
    await refresh();
  };

  const updateRecurringExpense = async (id: string, updates: Partial<RecurringExpense>) => {
    await db.updateRecurringExpense(id, updates);
    await refresh();
  };

  const deleteRecurringExpense = async (id: string) => {
    await db.deleteRecurringExpense(id);
    await refresh();
  };

  const toggleExpenseStatus = async (id: string) => {
    await db.toggleExpenseStatus(id);
    await refresh();
  };

  const addCostRecord = async (record: Omit<CostRecord, 'id' | 'createdAt'>) => {
    await db.addCostRecord(record);
    await refresh();
  };

  const deleteCostRecord = async (id: string) => {
    await db.deleteCostRecord(id);
    await refresh();
  };

  return (
    <ExpenseContext.Provider
      value={{
        recurringExpenses,
        costRecords,
        isLoading,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        addCostRecord,
        deleteCostRecord,
        toggleExpenseStatus,
        ...totals,
        refresh,
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
