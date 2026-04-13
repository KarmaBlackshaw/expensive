import { TransactionItem } from '@/components/transaction-item';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Transaction } from '@/types/expense';
import { StyleSheet, View } from 'react-native';

interface Props {
  dateKey: string; // YYYY-MM-DD
  transactions: Transaction[];
}

export function TransactionDateGroup({ dateKey, transactions }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Transactions */}
      {transactions.map(transaction => (
        <View key={transaction.id} style={[styles.row, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
          <TransactionItem transaction={transaction} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
