import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';

type Props = { value: string; onChangeText: (value: string) => void; onFocus: () => void };

export function DestinationCard({ value, onChangeText, onFocus }: Props) {
  return <View style={styles.card}><Image accessibilityLabel="Orange graduation cap" resizeMode="contain" source={require('./destination-cap.png')} style={styles.icon} /><View style={styles.copy}><Text style={styles.label}>DESTINATION</Text><TextInput accessibilityLabel="Destination" onChangeText={onChangeText} onFocus={onFocus} placeholder="Choose destination" placeholderTextColor={colors.textMuted} style={styles.input} value={value} /></View></View>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', gap: spacing[3], minHeight: 98, paddingHorizontal: spacing[4] }, icon: { height: 42, width: 46 }, copy: { flex: 1 }, label: { color: colors.steel, fontSize: 13, fontWeight: '800', letterSpacing: 1.1 }, input: { color: colors.ink, fontSize: 19, fontWeight: '700', marginTop: 4, padding: 0 } });
