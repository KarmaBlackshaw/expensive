import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

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
