import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import FolderOutlineIcon from '@/assets/icons/folder-outline.svg';

interface SettingsItemProps {
  Icon: React.FC<SvgProps>;
  label: string;
  onPress: () => void;
}

function SettingsItem({ Icon, label, onPress }: SettingsItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      style={[styles.settingsItem, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}
      onPress={onPress}>
      <Icon width={32} height={32} stroke={isDark ? '#fff' : '#333'} />
      <ThemedText style={styles.settingsLabel}>{label}</ThemedText>
    </Pressable>
  );
}

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          <SettingsItem
            Icon={FolderOutlineIcon}
            label="Categories"
            onPress={() => router.push('/categories')}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  settingsItem: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  settingsLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
});
