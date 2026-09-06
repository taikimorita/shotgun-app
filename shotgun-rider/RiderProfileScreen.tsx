import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onEditField?: (field: 'university' | 'graduationYear' | 'phoneNumber' | 'emergencyContact') => void; onSave?: () => void };
type Field = 'university' | 'graduationYear' | 'phoneNumber' | 'emergencyContact';

/** Exact rider-profile reference artwork with usable controls over its existing cards. */
export default function RiderProfileScreen({ onEditField, onSave }: Props) {
  const [selected, setSelected] = useState<Field | 'save' | null>(null);
  const choose = (field: Field) => { setSelected(field); onEditField?.(field); };
  return <ImageBackground accessibilityLabel="Maya Chen rider profile" resizeMode="contain" source={require('./rider-reference.png')} style={styles.screen}><View pointerEvents="box-none" style={styles.targets}><Card label="Edit university" active={selected === 'university'} onPress={() => choose('university')} style={styles.university} /><Card label="Edit graduation year" active={selected === 'graduationYear'} onPress={() => choose('graduationYear')} style={styles.graduationYear} /><Card label="Edit phone number" active={selected === 'phoneNumber'} onPress={() => choose('phoneNumber')} style={styles.phoneNumber} /><Card label="Edit emergency contact" active={selected === 'emergencyContact'} onPress={() => choose('emergencyContact')} style={styles.emergencyContact} /><Card label="Save rider profile" active={selected === 'save'} onPress={() => { setSelected('save'); onSave?.(); }} style={styles.save} /><Text accessibilityLiveRegion="polite" style={styles.announcement}>{selected ? `${selected} selected` : ''}</Text></View></ImageBackground>;
}

function Card({ label, active, onPress, style }: { label: string; active: boolean; onPress: () => void; style: object }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.target, style, active && styles.selected, pressed && styles.pressed]} />; }

const styles = StyleSheet.create({ screen: { flex: 1, width: '100%', aspectRatio: 478 / 909 }, targets: { ...StyleSheet.absoluteFillObject }, target: { position: 'absolute', left: '7%', right: '7%', borderRadius: 16 }, university: { top: '38.1%', height: '9.5%' }, graduationYear: { top: '48.8%', height: '9.5%' }, phoneNumber: { top: '59.4%', height: '9.5%' }, emergencyContact: { top: '70.2%', height: '9.5%' }, save: { top: '82%', height: '7.5%' }, selected: { borderColor: '#102A43', borderWidth: 3 }, pressed: { opacity: 0.72 }, announcement: { opacity: 0, position: 'absolute' } });
