import { FloatingActionButton } from '@/components/floating-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const { totalPaid, totalUnpaid, totalExpenses, plannedExpenses } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const totalPlanned = totalPaid + totalUnpaid;

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`;

  const formatDueDate = (dueDay: number) => {
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    return dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
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
            Total Planned
          </ThemedText>
          <ThemedText style={[styles.cardValue, { color: isDark ? '#fff' : '#333' }]}>
            {formatCurrency(totalPlanned)}
          </ThemedText>
        </View>

        <View style={[styles.card, styles.totalCard, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <ThemedText style={[styles.cardLabel, { color: isDark ? '#fff' : '#333' }]}>
            Total Expenses
          </ThemedText>
          <ThemedText style={[styles.cardValue, { color: isDark ? '#fff' : '#333' }]}>
            {formatCurrency(totalExpenses)}
          </ThemedText>
        </View>

        {/* Upcoming Payments */}
        <View style={styles.upcomingSection}>
          <ThemedText type="subtitle">Upcoming Payments</ThemedText>
          {plannedExpenses
            .filter(e => e.status === 'unpaid')
            .sort((a, b) => a.dueDay - b.dueDay)
            .slice(0, 5)
            .map(expense => (
              <View key={expense.id} style={[styles.upcomingItem, { backgroundColor: isDark ? '#333' : '#f9f9f9' }]}>
                <View>
                  <ThemedText style={styles.expenseName}>{expense.name}</ThemedText>
                  <ThemedText style={styles.expenseDue}>Due: {formatDueDate(expense.dueDay)}</ThemedText>
                </View>
                <ThemedText style={styles.expenseAmount}>{formatCurrency(expense.amount)}</ThemedText>
              </View>
            ))}
          {plannedExpenses.filter(e => e.status === 'unpaid').length === 0 && (
            <ThemedText style={styles.emptyText}>All payments complete! 🎉</ThemedText>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* FAB */}
      <FloatingActionButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
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
  bottomPadding: {
    height: 100,
  },
});
