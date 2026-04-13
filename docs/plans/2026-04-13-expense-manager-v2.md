# Expense Manager v2 - Enhancement Plan

**Date:** 2026-04-13
**Status:** Planning

## Overview

Enhance the expense manager with:
1. Menu actions (edit/delete) for items
2. Settings tab with category management (name only, no icons)
3. Monthly reset for totals
4. Rename "recurring" to "planned" expenses with recurring toggle
5. Rename "expenses" to "transactions" with date-based tabs (Daily/Monthly/Yearly/Total)
6. Transaction list grouped by date
7. Floating action button (visible on all tabs except Settings)
8. Bottom tab bar with icons
9. Category selection as chip grid (not dropdown)

---

## Task 1: Update Data Types

**Files:**
- Modify: `types/expense.ts`

**Changes:**
```typescript
export type ExpenseStatus = 'paid' | 'unpaid';

export interface Category {
  id: string;
  name: string;
}

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly' | 'none';

export interface PlannedExpense {
  id: string;
  name: string;
  dueDay: number; // 1-31 for monthly, 1-7 for weekly (day of week)
  dueMonth?: number; // 1-12, only for yearly recurrence
  amount: number;
  categoryId: string;
  payableThrough: string;
  status: ExpenseStatus;
  recurrence: RecurrenceFrequency; // replaces isRecurring boolean
  createdAt: string;
  paidAt?: string; // track when paid
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
```

---

## Task 2: Update Database Schema

**Files:**
- Modify: `services/database.ts`

**Changes:**
- Add `categories` table with id, name
- Rename `recurring_expenses` to `planned_expenses`
- Add `is_recurring`, `created_at`, `paid_at` columns to planned_expenses
- Rename `cost_records` to `transactions`
- Add `date`, `note` columns to transactions
- Add `monthly_reset` table for tracking last reset
- Add migration logic for existing data
- Add CRUD for categories
- Add monthly reset check function

---

## Task 3: Create Category Service Functions

**Files:**
- Modify: `services/database.ts`

**Add functions:**
```typescript
// Categories
getCategories(): Promise<Category[]>
addCategory(name: string): Promise<string>
updateCategory(id: string, name: string): Promise<void>
deleteCategory(id: string): Promise<void>

// Default categories seed
seedDefaultCategories(): Promise<void>
```

**Default categories:**
- Food
- Social Life
- Pets
- Transport
- Culture
- Household
- Apparel
- Beauty
- Health
- Education
- Gift
- Other

---

## Task 4: Add Monthly Reset Logic

**Files:**
- Modify: `services/database.ts`

**Add functions:**
```typescript
checkAndResetMonthly(): Promise<boolean>
// Returns true if reset was performed
// Resets all recurring planned expenses to 'unpaid'
// Clears non-recurring paid expenses (moves to history concept)
```

---

## Task 5: Update Expense Context

**Files:**
- Modify: `context/expense-context.tsx`

**Changes:**
- Add categories state and CRUD
- Rename recurringExpenses to plannedExpenses
- Rename costRecords to transactions  
- Rename totalCosts to totalExpenses
- Call checkAndResetMonthly on init
- Add transaction filtering by date range (daily/monthly/yearly/total)
- Group transactions by date for display

---

## Task 6: Update Tab Layout with Icons

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Changes:**
- Dashboard tab: chart icon (chart.pie.fill)
- Transactions tab: list icon (list.bullet.rectangle.fill) - renamed from Expenses
- Settings tab: gear icon (gearshape.fill)
- All tabs show icons in bottom bar

---

## Task 7: Create Settings Tab

**Files:**
- Create: `app/(tabs)/settings.tsx`

**settings.tsx:**
- "Categories" section header
- Category list (name only, no icons)
- Add category button
- Edit/delete menu for each category item

---

## Task 8: Create Category Components

**Files:**
- Create: `components/category-item.tsx`
- Create: `components/add-category-modal.tsx`
- Create: `components/edit-category-modal.tsx`

**category-item.tsx:**
- Shows category name
- Menu action (3-dot) for edit/delete

---

## Task 9: Create Menu Action Component

**Files:**
- Create: `components/menu-action.tsx`

**Implementation:**
- Three vertical dots button
- Opens action sheet with Edit, Delete options
- Reusable across all item types

---

## Task 10: Create Category Selector Component

**Files:**
- Create: `components/category-selector.tsx`

**Implementation (based on image 1):**
- Bottom sheet modal
- Header: "Category" with edit icon and close button
- Grid of category chips (3 columns)
- Each chip shows category name
- Selected chip highlighted
- Tapping selects and closes

---

## Task 11: Update Planned Expense Components

**Files:**
- Rename: `components/recurring-expense-item.tsx` → `components/planned-expense-item.tsx`
- Rename: `components/add-recurring-modal.tsx` → `components/add-planned-expense-modal.tsx`
- Create: `components/edit-planned-expense-modal.tsx`

**Changes:**
- Add MenuAction (3-dot menu) to item
- Show category name
- Add recurrence picker (None/Weekly/Monthly/Yearly) in add/edit modals
- Show due day picker (adapts based on recurrence type)
- Use CategorySelector for category selection

---

## Task 12: Update Transaction Components

**Files:**
- Rename: `components/cost-record-item.tsx` → `components/transaction-item.tsx`
- Rename: `components/add-cost-modal.tsx` → `components/add-transaction-modal.tsx`
- Create: `components/edit-transaction-modal.tsx`

**Changes:**
- Add MenuAction (3-dot menu) to item
- Show category name + amount
- Use CategorySelector for category selection
- Add date picker
- Add optional note field

---

## Task 13: Create Floating Action Button

**Files:**
- Create: `components/floating-action-button.tsx`

**Implementation (based on image 2):**
- Fixed position bottom-right (above tab bar)
- Circular red/coral button with + icon
- Visible on Dashboard and Transactions tabs (NOT Settings)
- Opens action sheet: "Add Planned Expense" or "Add Transaction"

---

## Task 14: Create Transactions Screen

**Files:**
- Rename: `app/(tabs)/expenses.tsx` → `app/(tabs)/transactions.tsx`

**Implementation (based on image 2):**
- Top tabs: Daily | Monthly | Yearly | Total
- Summary row: shows totals for selected period
- Transaction list grouped by date
- Date header: "13 Mon 04.2026" format
- Each item: category name, note/account, amount
- FAB for adding

---

## Task 15: Create Transaction List Component

**Files:**
- Create: `components/transaction-list.tsx`
- Create: `components/transaction-date-group.tsx`

**Implementation:**
- Groups transactions by date
- Date header with day, weekday, month.year
- List of transaction items under each date
- Supports filtering by date range

---

## Task 16: Update Dashboard Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Changes:**
- Rename "Total Miscellaneous Costs" → "Total Expenses"
- Rename "Recurring" → "Planned"
- Update upcoming payments to use planned expenses
- FAB visible

---

## Task 17: Final Testing

**Test checklist:**
- [ ] Add category (name only)
- [ ] Edit category name
- [ ] Delete category
- [ ] Category selector shows grid of chips
- [ ] Add planned expense (weekly recurrence)
- [ ] Add planned expense (monthly recurrence)
- [ ] Add planned expense (yearly recurrence)
- [ ] Add planned expense (no recurrence)
- [ ] Add transaction with date picker
- [ ] Edit via 3-dot menu
- [ ] Delete via 3-dot menu
- [ ] Toggle paid/unpaid on planned expense
- [ ] Monthly reset works for recurring items
- [ ] Dashboard totals correct
- [ ] FAB visible on Dashboard + Transactions
- [ ] FAB hidden on Settings
- [ ] Transaction tabs filter correctly (Daily/Monthly/Yearly/Total)
- [ ] Transactions grouped by date

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Update data types |
| 2 | Update database schema with migrations |
| 3 | Create category service functions |
| 4 | Add monthly reset logic |
| 5 | Update expense context |
| 6 | Update tab layout with icons |
| 7 | Create settings tab |
| 8 | Create category components |
| 9 | Create menu action component |
| 10 | Create category selector (chip grid) |
| 11 | Update planned expense components |
| 12 | Update transaction components |
| 13 | Create floating action button |
| 14 | Create transactions screen with tabs |
| 15 | Create transaction list (grouped by date) |
| 16 | Update dashboard screen |
| 17 | Final testing |

**Total: 17 tasks**
