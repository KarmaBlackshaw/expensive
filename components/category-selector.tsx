import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface Props {
  visible: boolean;
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  onClose: () => void;
}

export function CategorySelector({ visible, selectedCategoryId, onSelect, onClose }: Props) {
  const { categories } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle">Category</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeText}>✕</ThemedText>
            </Pressable>
          </View>

          {/* Category Grid */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {categories.map(category => {
                const isSelected = category.id === selectedCategoryId;
                return (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.chip,
                      { backgroundColor: isDark ? '#333' : '#f0f0f0' },
                      isSelected && styles.chipSelected,
                    ]}
                    onPress={() => handleSelect(category.id)}>
                    <ThemedText
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {category.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
  },
  scrollView: {
    flexGrow: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
