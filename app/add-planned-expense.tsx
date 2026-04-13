import { CategorySelector } from '@/components/category-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RecurrenceFrequency } from '@/types/expense';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

const RECURRENCE_OPTIONS: { label: string; value: RecurrenceFrequency }[] = [
  { label: 'None', value: 'none' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function AddPlannedExpenseScreen() {
  const { addPlannedExpense, getCategoryName } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [payableThrough, setPayableThrough] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>('monthly');
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !amount) return;

    addPlannedExpense({
      name: name.trim(),
      amount: parseFloat(amount),
      dueDay: parseInt(dueDay) || 1,
      categoryId,
      payableThrough: payableThrough.trim(),
      status: 'unpaid',
      recurrence,
    });

    router.back();
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: isDark ? '#333' : '#f0f0f0', color: isDark ? '#fff' : '#000' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>←</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Add Planned Expense</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={inputStyle}
          placeholder="Name"
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={inputStyle}
          placeholder="Amount"
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <TextInput
          style={inputStyle}
          placeholder="Due Day (1-31)"
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="number-pad"
        />

        {/* Category Selector */}
        <Pressable
          style={[inputStyle, styles.selector]}
          onPress={() => setShowCategorySelector(true)}>
          <ThemedText style={!categoryId && { opacity: 0.5 }}>
            {categoryId ? getCategoryName(categoryId) : 'Select Category'}
          </ThemedText>
        </Pressable>

        <TextInput
          style={inputStyle}
          placeholder="Payable Through (e.g., GCash, Bank)"
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={payableThrough}
          onChangeText={setPayableThrough}
        />

        {/* Recurrence Picker */}
        <ThemedText style={styles.label}>Recurrence</ThemedText>
        <View style={styles.recurrenceRow}>
          {RECURRENCE_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.recurrenceOption,
                { backgroundColor: isDark ? '#333' : '#f0f0f0' },
                recurrence === option.value && styles.recurrenceSelected,
              ]}
              onPress={() => setRecurrence(option.value)}>
              <ThemedText
                style={[
                  styles.recurrenceText,
                  recurrence === option.value && styles.recurrenceTextSelected,
                ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSubmit}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </Pressable>
      </ScrollView>

      <CategorySelector
        visible={showCategorySelector}
        selectedCategoryId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setShowCategorySelector(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  selector: {
    justifyContent: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  recurrenceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  recurrenceOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recurrenceSelected: {
    backgroundColor: '#007AFF',
  },
  recurrenceText: {
    fontSize: 13,
  },
  recurrenceTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
