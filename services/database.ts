import * as SQLite from 'expo-sqlite';
import { RecurringExpense, CostRecord } from '@/types/expense';

const db = SQLite.openDatabaseSync('expenses.db');

export async function initDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      due_day INTEGER NOT NULL,
      amount REAL NOT NULL,
      payable_through TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid'
    );

    CREATE TABLE IF NOT EXISTS cost_records (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      cost REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

// Recurring Expenses
export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const result = await db.getAllAsync<{
    id: string;
    name: string;
    due_day: number;
    amount: number;
    payable_through: string;
    status: string;
  }>('SELECT * FROM recurring_expenses ORDER BY due_day');
  
  return result.map(row => ({
    id: row.id,
    name: row.name,
    dueDay: row.due_day,
    amount: row.amount,
    payableThrough: row.payable_through,
    status: row.status as 'paid' | 'unpaid',
  }));
}

export async function addRecurringExpense(expense: Omit<RecurringExpense, 'id'>): Promise<string> {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  await db.runAsync(
    'INSERT INTO recurring_expenses (id, name, due_day, amount, payable_through, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, expense.name, expense.dueDay, expense.amount, expense.payableThrough, expense.status]
  );
  return id;
}

export async function updateRecurringExpense(id: string, updates: Partial<RecurringExpense>) {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.dueDay !== undefined) { fields.push('due_day = ?'); values.push(updates.dueDay); }
  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.payableThrough !== undefined) { fields.push('payable_through = ?'); values.push(updates.payableThrough); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  
  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE recurring_expenses SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteRecurringExpense(id: string) {
  await db.runAsync('DELETE FROM recurring_expenses WHERE id = ?', [id]);
}

export async function toggleExpenseStatus(id: string) {
  await db.runAsync(
    "UPDATE recurring_expenses SET status = CASE WHEN status = 'paid' THEN 'unpaid' ELSE 'paid' END WHERE id = ?",
    [id]
  );
}

// Cost Records
export async function getCostRecords(): Promise<CostRecord[]> {
  const result = await db.getAllAsync<{
    id: string;
    name: string;
    category: string;
    cost: number;
    created_at: string;
  }>('SELECT * FROM cost_records ORDER BY created_at DESC');
  
  return result.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    cost: row.cost,
    createdAt: row.created_at,
  }));
}

export async function addCostRecord(record: Omit<CostRecord, 'id' | 'createdAt'>): Promise<string> {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const createdAt = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO cost_records (id, name, category, cost, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, record.name, record.category, record.cost, createdAt]
  );
  return id;
}

export async function deleteCostRecord(id: string) {
  await db.runAsync('DELETE FROM cost_records WHERE id = ?', [id]);
}

// Aggregations
export async function getTotals() {
  const paidResult = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM recurring_expenses WHERE status = 'paid'"
  );
  const unpaidResult = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM recurring_expenses WHERE status = 'unpaid'"
  );
  const costsResult = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(cost), 0) as total FROM cost_records'
  );
  
  return {
    totalPaid: paidResult?.total ?? 0,
    totalUnpaid: unpaidResult?.total ?? 0,
    totalCosts: costsResult?.total ?? 0,
  };
}
