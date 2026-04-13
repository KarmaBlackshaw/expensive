import { Category, PlannedExpense, RecurrenceFrequency, Transaction } from '@/types/expense';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('expenses.db');

const DEFAULT_CATEGORIES = [
  'Food', 'Social Life', 'Pets', 'Transport', 'Culture', 'Household',
  'Apparel', 'Beauty', 'Health', 'Education', 'Gift', 'Other'
];

export async function initDatabase() {
  // Create new tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS planned_expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      due_day INTEGER NOT NULL,
      due_month INTEGER,
      amount REAL NOT NULL,
      category_id TEXT,
      payable_through TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      recurrence TEXT NOT NULL DEFAULT 'monthly',
      created_at TEXT NOT NULL,
      paid_at TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS monthly_reset (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_reset_month INTEGER NOT NULL,
      last_reset_year INTEGER NOT NULL
    );
  `);

  // Migrate old data if exists
  await migrateOldData();

  // Seed default categories if empty
  await seedDefaultCategories();
}

async function migrateOldData() {
  try {
    // Check if old tables exist
    const oldRecurring = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='recurring_expenses'"
    );

    if (oldRecurring.length > 0) {
      // Migrate recurring_expenses to planned_expenses
      await db.execAsync(`
        INSERT OR IGNORE INTO planned_expenses (id, name, due_day, amount, category_id, payable_through, status, recurrence, created_at)
        SELECT id, name, due_day, amount, NULL, payable_through, status, 'monthly', datetime('now')
        FROM recurring_expenses
      `);

      // Drop old table
      await db.execAsync('DROP TABLE IF EXISTS recurring_expenses');
    }

    const oldCosts = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='cost_records'"
    );

    if (oldCosts.length > 0) {
      // Migrate cost_records to transactions
      await db.execAsync(`
        INSERT OR IGNORE INTO transactions (id, name, category_id, amount, date, note)
        SELECT id, name, NULL, cost, created_at, NULL
        FROM cost_records
      `);

      // Drop old table
      await db.execAsync('DROP TABLE IF EXISTS cost_records');
    }
  } catch (error) {
    console.log('Migration skipped or completed:', error);
  }
}

async function seedDefaultCategories() {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (existing && existing.count === 0) {
    for (const name of DEFAULT_CATEGORIES) {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      await db.runAsync('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name]);
    }
  }
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name');
}

export async function addCategory(name: string): Promise<string> {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  await db.runAsync('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name]);
  return id;
}

export async function updateCategory(id: string, name: string): Promise<void> {
  await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
}

export async function deleteCategory(id: string): Promise<void> {
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

// Planned Expenses
export async function getPlannedExpenses(): Promise<PlannedExpense[]> {
  const result = await db.getAllAsync<{
    id: string;
    name: string;
    due_day: number;
    due_month: number | null;
    amount: number;
    category_id: string | null;
    payable_through: string;
    status: string;
    recurrence: string;
    created_at: string;
    paid_at: string | null;
  }>('SELECT * FROM planned_expenses ORDER BY due_day');

  return result.map(row => ({
    id: row.id,
    name: row.name,
    dueDay: row.due_day,
    dueMonth: row.due_month ?? undefined,
    amount: row.amount,
    categoryId: row.category_id ?? '',
    payableThrough: row.payable_through,
    status: row.status as 'paid' | 'unpaid',
    recurrence: row.recurrence as RecurrenceFrequency,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined,
  }));
}

export async function addPlannedExpense(expense: Omit<PlannedExpense, 'id' | 'createdAt' | 'paidAt'>): Promise<string> {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO planned_expenses (id, name, due_day, due_month, amount, category_id, payable_through, status, recurrence, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, expense.name, expense.dueDay, expense.dueMonth ?? null, expense.amount,
     expense.categoryId || null, expense.payableThrough, expense.status, expense.recurrence, createdAt]
  );
  return id;
}

export async function updatePlannedExpense(id: string, updates: Partial<PlannedExpense>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.dueDay !== undefined) { fields.push('due_day = ?'); values.push(updates.dueDay); }
  if (updates.dueMonth !== undefined) { fields.push('due_month = ?'); values.push(updates.dueMonth ?? null); }
  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.categoryId !== undefined) { fields.push('category_id = ?'); values.push(updates.categoryId || null); }
  if (updates.payableThrough !== undefined) { fields.push('payable_through = ?'); values.push(updates.payableThrough); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(updates.recurrence); }
  if (updates.paidAt !== undefined) { fields.push('paid_at = ?'); values.push(updates.paidAt ?? null); }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE planned_expenses SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deletePlannedExpense(id: string): Promise<void> {
  await db.runAsync('DELETE FROM planned_expenses WHERE id = ?', [id]);
}

export async function togglePlannedExpenseStatus(id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE planned_expenses SET
      status = CASE WHEN status = 'paid' THEN 'unpaid' ELSE 'paid' END,
      paid_at = CASE WHEN status = 'paid' THEN NULL ELSE ? END
    WHERE id = ?`,
    [now, id]
  );
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  const result = await db.getAllAsync<{
    id: string;
    name: string;
    category_id: string | null;
    amount: number;
    date: string;
    note: string | null;
  }>('SELECT * FROM transactions ORDER BY date DESC');

  return result.map(row => ({
    id: row.id,
    name: row.name,
    categoryId: row.category_id ?? '',
    amount: row.amount,
    date: row.date,
    note: row.note ?? undefined,
  }));
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  await db.runAsync(
    'INSERT INTO transactions (id, name, category_id, amount, date, note) VALUES (?, ?, ?, ?, ?, ?)',
    [id, transaction.name, transaction.categoryId || null, transaction.amount, transaction.date, transaction.note ?? null]
  );
  return id;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.categoryId !== undefined) { fields.push('category_id = ?'); values.push(updates.categoryId || null); }
  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
  if (updates.note !== undefined) { fields.push('note = ?'); values.push(updates.note ?? null); }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// Monthly Reset
export async function checkAndResetMonthly(): Promise<boolean> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Get last reset info
  const lastReset = await db.getFirstAsync<{ last_reset_month: number; last_reset_year: number }>(
    'SELECT last_reset_month, last_reset_year FROM monthly_reset WHERE id = 1'
  );

  // Check if we need to reset
  const needsReset = !lastReset ||
    lastReset.last_reset_year < currentYear ||
    (lastReset.last_reset_year === currentYear && lastReset.last_reset_month < currentMonth);

  if (needsReset) {
    // Reset all recurring planned expenses to unpaid
    await db.runAsync(
      "UPDATE planned_expenses SET status = 'unpaid', paid_at = NULL WHERE recurrence != 'none'"
    );

    // Update or insert reset tracking
    if (lastReset) {
      await db.runAsync(
        'UPDATE monthly_reset SET last_reset_month = ?, last_reset_year = ? WHERE id = 1',
        [currentMonth, currentYear]
      );
    } else {
      await db.runAsync(
        'INSERT INTO monthly_reset (id, last_reset_month, last_reset_year) VALUES (1, ?, ?)',
        [currentMonth, currentYear]
      );
    }

    return true;
  }

  return false;
}

// Aggregations
export async function getTotals() {
  const paidResult = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM planned_expenses WHERE status = 'paid'"
  );
  const unpaidResult = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM planned_expenses WHERE status = 'unpaid'"
  );
  const expensesResult = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM transactions'
  );

  return {
    totalPaid: paidResult?.total ?? 0,
    totalUnpaid: unpaidResult?.total ?? 0,
    totalExpenses: expensesResult?.total ?? 0,
  };
}
