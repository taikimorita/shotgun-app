import { Pressable, StyleSheet } from 'react-native';

export function DestinationCard({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityLabel="Choose destination: Northgate, Berkeley" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} />;
}

const styles = StyleSheet.create({ card: { position: 'absolute', left: '8%', right: '8%', top: '67.8%', height: '10.8%', borderRadius: 18 }, pressed: { opacity: 0.72 } });
