import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';
import { RiderCategoryButton } from './RiderCategoryButton';

type Field = 'University' | 'Graduation year' | 'Phone number' | 'Emergency contact';
type Props = { onEditField?: (field: Field) => void; onSave?: () => void };

const fields: Array<{ label: Field; value: string; icon: number }> = [
  { label: 'University', value: 'UC Berkeley', icon: require('./university-icon.png') },
  { label: 'Graduation year', value: '2026', icon: require('./graduation-icon.png') },
  { label: 'Phone number', value: '(510) 555-1234', icon: require('./phone-icon.png') },
  { label: 'Emergency contact', value: 'Add contact', icon: require('./emergency-icon.png') },
];

/** Rider profile made from real controls while retaining the supplied reference assets. */
export default function RiderProfileScreen({ onEditField, onSave }: Props) {
  const [selected, setSelected] = useState<Field | null>(null);
  const [saved, setSaved] = useState(false);
  const select = (field: Field) => { setSelected(field); setSaved(false); onEditField?.(field); };
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Image accessibilityLabel="Shotgun logo" resizeMode="contain" source={require('./shotgun-logo.png')} style={styles.logo} /><Text style={styles.title}>Your rider profile</Text><View style={styles.profile}><Image accessibilityLabel="Maya Chen profile picture" source={require('./maya-profile.png')} style={styles.profileImage} /><View><Text style={styles.name}>Maya Chen</Text><View style={styles.verified}><Text style={styles.check}>✓</Text><Text style={styles.verifiedText}>School email verified</Text></View></View></View>{fields.map((field) => <RiderCategoryButton key={field.label} {...field} selected={selected === field.label} onPress={() => select(field.label)} />)}<Pressable accessibilityRole="button" onPress={() => { setSaved(true); onSave?.(); }} style={({ pressed }) => [styles.save, pressed && styles.pressed]}><Text style={styles.saveText}>Save rider profile</Text></Pressable>{saved ? <Text accessibilityLiveRegion="polite" style={styles.saved}>Rider profile saved.</Text> : null}<Text style={styles.private}>Your information is secure and private.</Text></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.ice }, content: { flexGrow: 1, gap: spacing[3], padding: spacing[5] }, logo: { height: 64, marginTop: spacing[2], width: 235 }, title: { color: colors.ink, fontSize: 31, fontWeight: '800', letterSpacing: -0.8, marginBottom: spacing[2] }, profile: { alignItems: 'center', flexDirection: 'row', gap: spacing[4], marginBottom: spacing[2] }, profileImage: { height: 112, width: 112 }, name: { color: colors.ink, fontSize: 26, fontWeight: '800' }, verified: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.steelSoft, borderRadius: radii.pill, flexDirection: 'row', gap: 7, marginTop: 10, paddingHorizontal: 10, paddingVertical: 7 }, check: { color: colors.white, backgroundColor: colors.steel, borderRadius: 10, fontSize: 12, fontWeight: '800', height: 20, overflow: 'hidden', textAlign: 'center', width: 20 }, verifiedText: { color: colors.steel, fontSize: 14, fontWeight: '700' }, save: { alignItems: 'center', backgroundColor: colors.peach, borderRadius: radii.lg, justifyContent: 'center', marginTop: spacing[2], minHeight: 68 }, pressed: { opacity: 0.76 }, saveText: { color: colors.white, fontSize: 20, fontWeight: '800' }, saved: { color: colors.success, fontSize: 14, fontWeight: '700', textAlign: 'center' }, private: { color: colors.textMuted, fontSize: 14, paddingTop: spacing[2], textAlign: 'center' } });
