import { CategorySelector } from '@/components/category-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction, getCategoryName } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const transaction = transactions.find(t => t.id === id);

  const [name, setName] = useState(transaction?.name || '');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
  const [date, setDate] = useState(transaction ? new Date(transaction.date) : new Date());
  const [note, setNote] = useState(transaction?.note || '');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (transaction) {
      setName(transaction.name);
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.categoryId);
      setDate(new Date(transaction.date));
      setNote(transaction.note || '');
    }
  }, [transaction]);

  const handleSubmit = () => {
    if (!name.trim() || !amount || !id) return;

    updateTransaction(id, {
      name: name.trim(),
      amount: parseFloat(amount),
      categoryId,
      date: date.toISOString(),
      note: note.trim() || undefined,
    });

    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    deleteTransaction(id);
    router.back();
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <ThemedText style={styles.title}>Edit Transaction</ThemedText>
        <View style={{ flex: 1 }} />
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <ThemedText style={styles.deleteText}>🗑</ThemedText>
        </Pressable>
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

        {/* Category Selector */}
        <Pressable
          style={[inputStyle, styles.selector]}
          onPress={() => setShowCategorySelector(true)}>
          <ThemedText style={!categoryId && { opacity: 0.5 }}>
            {categoryId ? getCategoryName(categoryId) : 'Select Category'}
          </ThemedText>
        </Pressable>

        {/* Date Picker */}
        <Pressable
          style={[inputStyle, styles.selector]}
          onPress={() => setShowDatePicker(true)}>
          <ThemedText>{formatDate(date)}</ThemedText>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <TextInput
          style={inputStyle}
          placeholder="Note (optional)"
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={note}
          onChangeText={setNote}
        />

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
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
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
