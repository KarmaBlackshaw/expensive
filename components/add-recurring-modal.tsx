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
