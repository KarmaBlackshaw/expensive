import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

interface MenuOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  options: MenuOption[];
}

export function MenuAction({ options }: Props) {
  const [visible, setVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleOptionPress = (option: MenuOption) => {
    setVisible(false);
    option.onPress();
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.trigger}>
        <ThemedText style={styles.dots}>⋮</ThemedText>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <ThemedView style={[styles.menu, isDark && styles.menuDark]}>
            {options.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                ]}
                onPress={() => handleOptionPress(option)}>
                <ThemedText
                  style={[
                    styles.optionText,
                    option.destructive && styles.destructive,
                  ]}>
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 8,
  },
  dots: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    borderRadius: 12,
    minWidth: 200,
    overflow: 'hidden',
  },
  menuDark: {
    backgroundColor: '#2c2c2e',
  },
  option: {
    padding: 16,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  destructive: {
    color: '#FF3B30',
  },
});
