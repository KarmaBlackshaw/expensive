import { MenuAction } from '@/components/menu-action';
import { ThemedText } from '@/components/themed-text';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PlannedExpense } from '@/types/expense';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

interface Props {
  expense: PlannedExpense;
}

export function PlannedExpenseItem({ expense }: Props) {
  const { togglePlannedExpenseStatus, deletePlannedExpense, getCategoryName } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isPaid = expense.status === 'paid';
  const categoryName = getCategoryName(expense.categoryId);

  const getRecurrenceLabel = () => {
    switch (expense.recurrence) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'One-time';
    }
  };

  const menuOptions = [
    {
      label: 'Edit',
      onPress: () => router.push(`/edit-planned-expense?id=${expense.id}`),
    },
    {
      label: 'Delete',
      onPress: () => deletePlannedExpense(expense.id),
      destructive: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#333' : '#f9f9f9' }]}>
      <Pressable
        style={[styles.statusButton, isPaid && styles.statusPaid]}
        onPress={() => togglePlannedExpenseStatus(expense.id)}>
        <ThemedText style={styles.statusText}>{isPaid ? '✓' : ''}</ThemedText>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.row}>
          <ThemedText style={[styles.name, isPaid && styles.namePaid]}>{expense.name}</ThemedText>
          <ThemedText style={styles.amount}>₱{expense.amount.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.meta}>
            {categoryName} • Due: {expense.dueDay} • {getRecurrenceLabel()}
          </ThemedText>
        </View>
        <ThemedText style={styles.payable}>via {expense.payableThrough}</ThemedText>
      </View>

      <MenuAction options={menuOptions} />
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
  statusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusPaid: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  namePaid: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  payable: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
});
