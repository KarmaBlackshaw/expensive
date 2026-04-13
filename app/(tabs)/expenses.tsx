import { AddCostModal } from '@/components/add-cost-modal';
import { AddRecurringModal } from '@/components/add-recurring-modal';
import { CostRecordItem } from '@/components/cost-record-item';
import { RecurringExpenseItem } from '@/components/recurring-expense-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ExpensesScreen() {
  const { recurringExpenses, costRecords } = useExpenses();

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
