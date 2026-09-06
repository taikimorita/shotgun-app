import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';

type Props = { icon: ImageSourcePropType; label: string; value: string; selected: boolean; onPress: () => void };

export function RiderCategoryButton({ icon, label, value, selected, onPress }: Props) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.button, selected && styles.selected, pressed && styles.pressed]}><Image accessibilityLabel="" resizeMode="contain" source={icon} style={styles.icon} /><View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View><Text style={styles.chevron}>›</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', gap: spacing[3], minHeight: 82, paddingHorizontal: spacing[4] }, selected: { borderColor: colors.navy, borderWidth: 2 }, pressed: { opacity: 0.76 }, icon: { height: 45, width: 45 }, copy: { flex: 1 }, label: { color: colors.textMuted, fontSize: 15, fontWeight: '600' }, value: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 3 }, chevron: { color: colors.textMuted, fontSize: 33, fontWeight: '300' } });
