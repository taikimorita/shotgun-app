import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/src/theme/tokens';

type Props = { requested: boolean; onRequest: () => void };

export function RideRequestPanel({ requested, onRequest }: Props) {
  return <View style={styles.wrap}><View style={styles.facts}><View><Text style={styles.value}>$3.50</Text><Text style={styles.label}>per rider</Text></View><View><Text style={[styles.value, styles.right]}>8 min</Text><Text style={[styles.label, styles.right]}>pickup</Text></View></View><Pressable accessibilityRole="button" onPress={onRequest} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>{requested ? 'Ride requested' : 'Request to ride with Jordan'}</Text></Pressable></View>;
}

const styles = StyleSheet.create({ wrap: { gap: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 }, facts: { flexDirection: 'row', justifyContent: 'space-between' }, value: { color: colors.ink, fontSize: 25, fontWeight: '800' }, label: { color: colors.textMuted, fontSize: 16, marginTop: 4 }, right: { textAlign: 'right' }, button: { minHeight: 58, borderRadius: radii.lg, backgroundColor: colors.steel, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, buttonText: { color: colors.white, fontSize: 20, fontWeight: '800' }, pressed: { opacity: 0.72 } });
