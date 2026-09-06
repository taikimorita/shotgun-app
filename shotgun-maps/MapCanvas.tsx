import { Pressable, StyleSheet } from 'react-native';

export function MapCanvas({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityLabel="Open route map" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.map, pressed && styles.pressed]} />;
}

const styles = StyleSheet.create({ map: { position: 'absolute', left: '8%', right: '8%', top: '18%', height: '29%', borderRadius: 22 }, pressed: { opacity: 0.72 } });
