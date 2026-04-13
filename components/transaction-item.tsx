import { ThemedText } from '@/components/themed-text';
import { useExpenses } from '@/context/expense-context';
import { Transaction } from '@/types/expense';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

interface Props {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: Props) {
  const { getCategoryName } = useExpenses();

  const categoryName = getCategoryName(transaction.categoryId);

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/edit-transaction?id=${transaction.id}`)}>
      <ThemedText style={styles.category} numberOfLines={1}>{categoryName}</ThemedText>
      <ThemedText style={styles.name} numberOfLines={1}>{transaction.name}</ThemedText>
      <ThemedText style={styles.amount}>₱{transaction.amount.toFixed(2)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  category: {
    width: 70,
    fontSize: 13,
    fontWeight: '500',
  },
  name: {
    flex: 1,
    fontSize: 13,
    opacity: 0.6,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
