import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii } from '@/src/theme/tokens';

export function ViewRidesButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.text}>View rides</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { alignItems: 'center', backgroundColor: colors.steel, borderRadius: radii.lg, justifyContent: 'center', minHeight: 64 }, pressed: { backgroundColor: colors.navy }, text: { color: colors.white, fontSize: 21, fontWeight: '800' } });
