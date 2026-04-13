import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

export function FloatingActionButton() {
  const [showMenu, setShowMenu] = useState(false);

  const handlePlannedExpense = () => {
    setShowMenu(false);
    router.push('/add-planned-expense');
  };

  const handleTransaction = () => {
    setShowMenu(false);
    router.push('/add-transaction');
  };

  return (
    <>
      {/* FAB Button */}
      <Pressable style={styles.fab} onPress={() => setShowMenu(true)}>
        <ThemedText style={styles.fabIcon}>+</ThemedText>
      </Pressable>

      {/* Action Menu */}
      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <Pressable style={styles.menuItem} onPress={handlePlannedExpense}>
              <ThemedView style={styles.menuItemContent}>
                <ThemedText style={styles.menuText}>Add Planned Expense</ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleTransaction}>
              <ThemedView style={styles.menuItemContent}>
                <ThemedText style={styles.menuText}>Add Transaction</ThemedText>
              </ThemedView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    paddingBottom: 160,
    paddingRight: 20,
    alignItems: 'flex-end',
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItemContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
