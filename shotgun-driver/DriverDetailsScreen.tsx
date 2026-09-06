import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

type Field = 'driverLicense' | 'studentId' | 'age' | 'photo' | 'carInformation';
type Props = { onEditField?: (field: Field) => void; onSubmit?: () => void };

/** Exact driver-details reference artwork with usable controls over its existing cards. */
export default function DriverDetailsScreen({ onEditField, onSubmit }: Props) {
  const [selected, setSelected] = useState<Field | 'submit' | null>(null);
  const choose = (field: Field) => { setSelected(field); onEditField?.(field); };
  return <ImageBackground accessibilityLabel="Driver details verification" resizeMode="contain" source={require('./driver-reference.png')} style={styles.screen}><View pointerEvents="box-none" style={styles.targets}><Card label="Upload driver license" active={selected === 'driverLicense'} onPress={() => choose('driverLicense')} style={styles.driverLicense} /><Card label="Upload student ID" active={selected === 'studentId'} onPress={() => choose('studentId')} style={styles.studentId} /><Card label="Confirm age" active={selected === 'age'} onPress={() => choose('age')} style={styles.age} /><Card label="Upload your photo" active={selected === 'photo'} onPress={() => choose('photo')} style={styles.photo} /><Card label="Edit car information" active={selected === 'carInformation'} onPress={() => choose('carInformation')} style={styles.carInformation} /><Card label="Submit for verification" active={selected === 'submit'} onPress={() => { setSelected('submit'); onSubmit?.(); }} style={styles.submit} /><Text accessibilityLiveRegion="polite" style={styles.announcement}>{selected ? `${selected} selected` : ''}</Text></View></ImageBackground>;
}

function Card({ label, active, onPress, style }: { label: string; active: boolean; onPress: () => void; style: object }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.target, style, active && styles.selected, pressed && styles.pressed]} />; }

const styles = StyleSheet.create({ screen: { flex: 1, width: '100%', aspectRatio: 480 / 909 }, targets: { ...StyleSheet.absoluteFillObject }, target: { position: 'absolute', left: '7%', right: '7%', borderRadius: 16 }, driverLicense: { top: '34%', height: '8.6%' }, studentId: { top: '43.4%', height: '8.6%' }, age: { top: '53%', height: '8.6%' }, photo: { top: '62.6%', height: '8.6%' }, carInformation: { top: '71.7%', height: '9.3%' }, submit: { top: '84.2%', height: '7.4%' }, selected: { borderColor: '#102A43', borderWidth: 3 }, pressed: { opacity: 0.72 }, announcement: { opacity: 0, position: 'absolute' } });
