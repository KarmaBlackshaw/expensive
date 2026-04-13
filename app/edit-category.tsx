import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, updateCategory } = useExpenses();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const category = categories.find(c => c.id === id);
  const [name, setName] = useState(category?.name || '');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = () => {
    if (!name.trim() || !id) return;
    updateCategory(id, name.trim());
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
        <ThemedText style={styles.title}>Edit Category</ThemedText>
      </View>

      <View style={styles.content}>
        <TextInput
          style={inputStyle}
          placeholder="Category name"
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Pressable style={styles.saveButton} onPress={handleSubmit}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </Pressable>
      </View>
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
