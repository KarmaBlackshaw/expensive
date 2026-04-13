import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Category } from '@/types/expense';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

function CategoryItem({ category }: { category: Category }) {
  const { deleteCategory } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.categoryItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
      <Pressable onPress={() => deleteCategory(category.id)} style={styles.deleteIcon}>
        <ThemedText style={styles.deleteIconText}>−</ThemedText>
      </Pressable>
      <Pressable
        style={styles.categoryContent}
        onPress={() => router.push(`/edit-category?id=${category.id}`)}>
        <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
      </Pressable>
      <Pressable
        style={styles.editIcon}
        onPress={() => router.push(`/edit-category?id=${category.id}`)}>
        <ThemedText style={styles.editIconText}>✎</ThemedText>
      </Pressable>
      <View style={styles.reorderIcon}>
        <ThemedText style={styles.reorderIconText}>≡</ThemedText>
      </View>
    </View>
  );
}

export default function CategoriesScreen() {
  const { categories } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#444' : '#e0e0e0' }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>←</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Categories</ThemedText>
        <Pressable onPress={() => router.push('/add-category')} style={styles.addButton}>
          <ThemedText style={styles.addText}>+</ThemedText>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map(category => (
          <CategoryItem key={category.id} category={category} />
        ))}

        {categories.length === 0 && (
          <ThemedText style={styles.emptyText}>No categories yet</ThemedText>
        )}
      </ScrollView>
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
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  addText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  deleteIcon: {
    padding: 4,
  },
  deleteIconText: {
    fontSize: 20,
    color: '#FF3B30',
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
  },
  editIcon: {
    padding: 4,
  },
  editIconText: {
    fontSize: 16,
    opacity: 0.4,
  },
  reorderIcon: {
    padding: 4,
  },
  reorderIconText: {
    fontSize: 18,
    opacity: 0.4,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 40,
  },
});
