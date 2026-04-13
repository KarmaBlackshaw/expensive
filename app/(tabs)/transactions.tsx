import { FloatingActionButton } from '@/components/floating-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionDateGroup } from '@/components/transaction-date-group';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type TabType = 'daily' | 'monthly';

export default function TransactionsScreen() {
  const { transactions, getTransactionsGroupedByDate } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<TabType>('daily');

  // Get all transactions for the current day
  const dailyTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return transactions.filter(t => new Date(t.date) >= startOfDay);
  }, [transactions]);

  const groupedTransactions = useMemo(() => {
    return getTransactionsGroupedByDate(dailyTransactions);
  }, [dailyTransactions, getTransactionsGroupedByDate]);

  // Monthly summary data
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: string; dateRange: string; total: number }[] = [];
    let grandTotal = 0;

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const dateRange = `${monthDate.getMonth() + 1}.1 - ${monthDate.getMonth() + 1}.${lastDay}`;

      const monthTotal = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      if (monthTotal > 0 || i < 4) {
        months.push({ month: monthName, dateRange, total: monthTotal });
      }
      grandTotal += monthTotal;
    }

    return { months, grandTotal };
  }, [transactions]);

  const dailyTotal = useMemo(() => {
    return dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [dailyTransactions]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'monthly', label: 'Monthly' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
        {tabs.map(tab => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}>
            <ThemedText
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'daily' ? (
        <>
          {/* Summary */}
          <View style={[styles.summary, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
            <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#FF3B30' }]}>
              ₱{dailyTotal.toFixed(2)}
            </ThemedText>
          </View>

          {/* Transaction List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {Array.from(groupedTransactions.entries()).map(([dateKey, trans]) => (
              <TransactionDateGroup key={dateKey} dateKey={dateKey} transactions={trans} />
            ))}

            {dailyTransactions.length === 0 && (
              <ThemedText style={styles.emptyText}>No transactions today</ThemedText>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </>
      ) : (
        <>
          {/* Monthly Summary Header */}
          <View style={[styles.summary, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
            <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#FF3B30' }]}>
              ₱{monthlyData.grandTotal.toFixed(2)}
            </ThemedText>
          </View>

          {/* Monthly List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {monthlyData.months.map((m, idx) => (
              <View key={idx} style={[styles.monthRow, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
                <View>
                  <ThemedText style={styles.monthName}>{m.month}</ThemedText>
                  <ThemedText style={styles.monthRange}>{m.dateRange}</ThemedText>
                </View>
                <ThemedText style={[styles.monthTotal, { color: '#FF3B30' }]}>
                  ₱{m.total.toFixed(2)}
                </ThemedText>
              </View>
            ))}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </>
      )}

      {/* FAB */}
      <FloatingActionButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF3B30',
  },
  tabText: {
    fontSize: 14,
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryLabel: {
    fontSize: 13,
    opacity: 0.6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  monthName: {
    fontSize: 15,
    fontWeight: '500',
  },
  monthRange: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  monthTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 40,
  },
  bottomPadding: {
    height: 100,
  },
});
