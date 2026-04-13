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
