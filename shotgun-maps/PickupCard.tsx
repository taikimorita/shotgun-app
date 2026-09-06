import { Pressable, StyleSheet } from 'react-native';

export function PickupCard({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityLabel="Choose pickup: Sproul Plaza" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} />;
}

const styles = StyleSheet.create({ card: { position: 'absolute', left: '8%', right: '8%', top: '55.2%', height: '10.8%', borderRadius: 18 }, pressed: { opacity: 0.72 } });
