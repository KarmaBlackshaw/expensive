import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CostRecord } from '@/types/expense';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  record: CostRecord;
}

export function CostRecordItem({ record }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#333' : '#f9f9f9' }]}>
      <View style={styles.categoryBadge}>
        <ThemedText style={styles.categoryText}>{record.category}</ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{record.name}</ThemedText>
      </View>
      <ThemedText style={styles.cost}>₱{record.cost.toLocaleString()}</ThemedText>
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
  categoryBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
  },
  cost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
