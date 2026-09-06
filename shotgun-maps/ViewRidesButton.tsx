import { Pressable, StyleSheet } from 'react-native';

export function ViewRidesButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityLabel="View rides" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]} />;
}

const styles = StyleSheet.create({ button: { position: 'absolute', left: '8%', right: '8%', top: '81.1%', height: '7.8%', borderRadius: 16 }, pressed: { opacity: 0.72 } });
