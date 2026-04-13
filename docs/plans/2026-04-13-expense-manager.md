# Expense Manager App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a simple expense manager with recurring expenses, one-time costs, and a dashboard summary.

**Architecture:** 
- Two tabs: Dashboard (home) and Expenses
- Local state with React Context (no backend for MVP)
- AsyncStorage for persistence
- Data models: RecurringExpense (name, dueDay, amount, payableThrough, status) and CostRecord (name, category, cost)

**Tech Stack:** React Native, Expo Router, Expo SQLite, react-native-chart-kit

---

## Task 1: Install Dependencies

**Step 1: Install required packages**

Run:
```bash
npx expo install expo-sqlite react-native-chart-kit react-native-svg
```

**Step 2: Verify installation**

Run: `cat package.json | grep -E "expo-sqlite|chart-kit|svg"`

Expected: All three packages listed in dependencies

---

## Task 2: Create Data Types

**Files:**
- Create: `types/expense.ts`

**Step 1: Create types file**

```typescript
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
```

---

## Task 3: Create Database Service

**Files:**
- Create: `services/database.ts`

**Step 1: Create SQLite database service**

```typescript
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
```

---

## Task 4: Create Expense Context

**Files:**
- Create: `context/expense-context.tsx`

**Step 1: Create context that wraps database service**

```typescript
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
```

---

## Task 5: Wrap App with Provider

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Add ExpenseProvider to root layout**

Add import at top:
```typescript
import { ExpenseProvider } from '@/context/expense-context';
```

Wrap the existing layout content with `<ExpenseProvider>`:
```typescript
<ExpenseProvider>
  {/* existing content */}
</ExpenseProvider>
```

---

## Task 6: Update Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Delete: `app/(tabs)/explore.tsx`

**Step 1: Rename tabs to Dashboard and Expenses**

Replace the Tabs.Screen components:
```typescript
<Tabs.Screen
  name="index"
  options={{
    title: 'Dashboard',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.pie.fill" color={color} />,
  }}
/>
<Tabs.Screen
  name="expenses"
  options={{
    title: 'Expenses',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />,
  }}
/>
```

**Step 2: Delete explore.tsx**

Run: `rm app/(tabs)/explore.tsx`

**Step 3: Create expenses.tsx placeholder**

Create `app/(tabs)/expenses.tsx`:
```typescript
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function ExpensesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Expenses</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

---

## Task 7: Build Dashboard Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Replace with dashboard implementation**

```typescript
import { StyleSheet, ScrollView, View, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { PieChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/use-color-scheme';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { totalPaid, totalUnpaid, totalCosts, recurringExpenses } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const total = totalPaid + totalUnpaid;

  const chartData = [
    {
      name: 'Paid',
      amount: totalPaid,
      color: '#4CAF50',
      legendFontColor: isDark ? '#fff' : '#333',
      legendFontSize: 14,
    },
    {
      name: 'Unpaid',
      amount: totalUnpaid,
      color: '#F44336',
      legendFontColor: isDark ? '#fff' : '#333',
      legendFontSize: 14,
    },
  ];

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.header}>Dashboard</ThemedText>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.card, { backgroundColor: '#4CAF50' }]}>
            <ThemedText style={styles.cardLabel}>Total Paid</ThemedText>
            <ThemedText style={styles.cardValue}>{formatCurrency(totalPaid)}</ThemedText>
          </View>
          <View style={[styles.card, { backgroundColor: '#F44336' }]}>
            <ThemedText style={styles.cardLabel}>Total Unpaid</ThemedText>
            <ThemedText style={styles.cardValue}>{formatCurrency(totalUnpaid)}</ThemedText>
          </View>
        </View>

        <View style={[styles.card, styles.totalCard, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <ThemedText style={[styles.cardLabel, { color: isDark ? '#fff' : '#333' }]}>
            Total Recurring
          </ThemedText>
          <ThemedText style={[styles.cardValue, { color: isDark ? '#fff' : '#333' }]}>
            {formatCurrency(total)}
          </ThemedText>
        </View>

        <View style={[styles.card, styles.totalCard, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <ThemedText style={[styles.cardLabel, { color: isDark ? '#fff' : '#333' }]}>
            Total Miscellaneous Costs
          </ThemedText>
          <ThemedText style={[styles.cardValue, { color: isDark ? '#fff' : '#333' }]}>
            {formatCurrency(totalCosts)}
          </ThemedText>
        </View>

        {/* Chart */}
        {total > 0 && (
          <View style={styles.chartContainer}>
            <ThemedText type="subtitle" style={styles.chartTitle}>
              Payment Status
            </ThemedText>
            <PieChart
              data={chartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Upcoming Payments */}
        <View style={styles.upcomingSection}>
          <ThemedText type="subtitle">Upcoming Payments</ThemedText>
          {recurringExpenses
            .filter(e => e.status === 'unpaid')
            .sort((a, b) => a.dueDay - b.dueDay)
            .slice(0, 5)
            .map(expense => (
              <View key={expense.id} style={[styles.upcomingItem, { backgroundColor: isDark ? '#333' : '#f9f9f9' }]}>
                <View>
                  <ThemedText style={styles.expenseName}>{expense.name}</ThemedText>
                  <ThemedText style={styles.expenseDue}>Due: Day {expense.dueDay}</ThemedText>
                </View>
                <ThemedText style={styles.expenseAmount}>{formatCurrency(expense.amount)}</ThemedText>
              </View>
            ))}
          {recurringExpenses.filter(e => e.status === 'unpaid').length === 0 && (
            <ThemedText style={styles.emptyText}>All payments complete! 🎉</ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 60,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  totalCard: {
    marginBottom: 12,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  cardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chartTitle: {
    marginBottom: 10,
  },
  upcomingSection: {
    marginTop: 10,
  },
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseDue: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
});
```

---

## Task 8: Build Expenses Screen - Recurring Section

**Files:**
- Modify: `app/(tabs)/expenses.tsx`
- Create: `components/recurring-expense-item.tsx`
- Create: `components/add-recurring-modal.tsx`

**Step 1: Create RecurringExpenseItem component**

Create `components/recurring-expense-item.tsx`:
```typescript
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { RecurringExpense } from '@/types/expense';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  expense: RecurringExpense;
}

export function RecurringExpenseItem({ expense }: Props) {
  const { toggleExpenseStatus, deleteRecurringExpense } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const statusColor = expense.status === 'paid' ? '#4CAF50' : '#FF9800';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#333' : '#f9f9f9' }]}>
      <Pressable
        style={[styles.statusBadge, { backgroundColor: statusColor }]}
        onPress={() => toggleExpenseStatus(expense.id)}>
        <ThemedText style={styles.statusText}>
          {expense.status.toUpperCase()}
        </ThemedText>
      </Pressable>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{expense.name}</ThemedText>
        <ThemedText style={styles.details}>
          Due: Day {expense.dueDay} • {expense.payableThrough}
        </ThemedText>
      </View>
      <ThemedText style={styles.amount}>₱{expense.amount.toLocaleString()}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

**Step 2: Create AddRecurringModal component**

Create `components/add-recurring-modal.tsx`:
```typescript
import { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddRecurringModal({ visible, onClose }: Props) {
  const { addRecurringExpense } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [amount, setAmount] = useState('');
  const [payableThrough, setPayableThrough] = useState('');

  const handleSubmit = () => {
    if (!name || !dueDay || !amount) return;

    addRecurringExpense({
      name,
      dueDay: parseInt(dueDay, 10),
      amount: parseFloat(amount),
      payableThrough: payableThrough || 'Cash',
      status: 'unpaid',
    });

    setName('');
    setDueDay('');
    setAmount('');
    setPayableThrough('');
    onClose();
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: isDark ? '#444' : '#f0f0f0', color: isDark ? '#fff' : '#000' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="subtitle" style={styles.title}>Add Recurring Expense</ThemedText>

          <TextInput
            style={inputStyle}
            placeholder="Name"
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={inputStyle}
            placeholder="Due Day (1-31)"
            placeholderTextColor={isDark ? '#888' : '#999'}
            keyboardType="number-pad"
            value={dueDay}
            onChangeText={setDueDay}
          />
          <TextInput
            style={inputStyle}
            placeholder="Amount"
            placeholderTextColor={isDark ? '#888' : '#999'}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={inputStyle}
            placeholder="Payable Through (e.g., GCash, Unionbank)"
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={payableThrough}
            onChangeText={setPayableThrough}
          />

          <View style={styles.buttons}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <ThemedText>Cancel</ThemedText>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <ThemedText style={{ color: '#fff' }}>Add</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
});
```

---

## Task 9: Build Expenses Screen - Cost Records Section

**Files:**
- Create: `components/cost-record-item.tsx`
- Create: `components/add-cost-modal.tsx`

**Step 1: Create CostRecordItem component**

Create `components/cost-record-item.tsx`:
```typescript
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CostRecord } from '@/types/expense';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  record: CostRecord;
}

export function CostRecordItem({ record }: Props) {
  const { deleteCostRecord } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#333' : '#f9f9f9' }]}>
      <View style={styles.categoryBadge}>
        <ThemedText style={styles.categoryText}>{record.category}</ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{record.name}</ThemedText>
      </View>
      <ThemedText style={styles.cost}>₱{record.cost.toLocaleString()}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
  },
  cost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

**Step 2: Create AddCostModal component**

Create `components/add-cost-modal.tsx`:
```typescript
import { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddCostModal({ visible, onClose }: Props) {
  const { addCostRecord } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');

  const handleSubmit = () => {
    if (!name || !cost) return;

    addCostRecord({
      name,
      category: category || 'Miscellaneous',
      cost: parseFloat(cost),
    });

    setName('');
    setCategory('');
    setCost('');
    onClose();
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: isDark ? '#444' : '#f0f0f0', color: isDark ? '#fff' : '#000' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="subtitle" style={styles.title}>Add Cost Record</ThemedText>

          <TextInput
            style={inputStyle}
            placeholder="Name"
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={inputStyle}
            placeholder="Category (e.g., Food, Gas, Materials)"
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={inputStyle}
            placeholder="Cost"
            placeholderTextColor={isDark ? '#888' : '#999'}
            keyboardType="decimal-pad"
            value={cost}
            onChangeText={setCost}
          />

          <View style={styles.buttons}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <ThemedText>Cancel</ThemedText>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <ThemedText style={{ color: '#fff' }}>Add</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
});
```

---

## Task 10: Complete Expenses Screen

**Files:**
- Modify: `app/(tabs)/expenses.tsx`

**Step 1: Implement full expenses screen**

```typescript
import { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { RecurringExpenseItem } from '@/components/recurring-expense-item';
import { CostRecordItem } from '@/components/cost-record-item';
import { AddRecurringModal } from '@/components/add-recurring-modal';
import { AddCostModal } from '@/components/add-cost-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExpensesScreen() {
  const { recurringExpenses, costRecords } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.header}>Expenses</ThemedText>

        {/* Recurring Expenses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Recurring Expenses</ThemedText>
            <Pressable
              style={styles.addBtn}
              onPress={() => setShowRecurringModal(true)}>
              <ThemedText style={styles.addBtnText}>+ Add</ThemedText>
            </Pressable>
          </View>
          {recurringExpenses
            .sort((a, b) => a.dueDay - b.dueDay)
            .map(expense => (
              <RecurringExpenseItem key={expense.id} expense={expense} />
            ))}
          {recurringExpenses.length === 0 && (
            <ThemedText style={styles.emptyText}>No recurring expenses yet</ThemedText>
          )}
        </View>

        {/* Cost Records Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Miscellaneous Costs</ThemedText>
            <Pressable
              style={styles.addBtn}
              onPress={() => setShowCostModal(true)}>
              <ThemedText style={styles.addBtnText}>+ Add</ThemedText>
            </Pressable>
          </View>
          {costRecords.map(record => (
            <CostRecordItem key={record.id} record={record} />
          ))}
          {costRecords.length === 0 && (
            <ThemedText style={styles.emptyText}>No cost records yet</ThemedText>
          )}
        </View>
      </ScrollView>

      <AddRecurringModal
        visible={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
      />
      <AddCostModal
        visible={showCostModal}
        onClose={() => setShowCostModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 60,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 20,
  },
});
```

---

## Task 11: Final Testing & Cleanup

**Step 1: Run the app**

Run: `npx expo start`

**Step 2: Test all features**
- [ ] Add recurring expense
- [ ] Toggle paid/unpaid status
- [ ] Add cost record
- [ ] View dashboard totals
- [ ] View pie chart
- [ ] Data persists after reload

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Install dependencies (expo-sqlite, chart-kit) |
| 2 | Create data types |
| 3 | Create SQLite database service |
| 4 | Create expense context |
| 5 | Wrap app with provider |
| 6 | Update tab layout |
| 7 | Build dashboard screen |
| 8 | Build recurring expense components |
| 9 | Build cost record components |
| 10 | Complete expenses screen |
| 11 | Final testing |
