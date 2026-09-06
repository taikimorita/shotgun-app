import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/src/theme/tokens';

type Props = { activeStop: 'pickup' | 'destination'; onSelectStop: (stop: 'pickup' | 'destination') => void };

export function MapCanvas({ activeStop, onSelectStop }: Props) {
  return <View accessibilityLabel="Route map from Sproul Plaza to Northgate, Berkeley" style={styles.map}><View style={[styles.road, styles.roadOne]} /><View style={[styles.road, styles.roadTwo]} /><View style={styles.route} /><Pressable accessibilityLabel="Pickup waypoint: Sproul Plaza" accessibilityRole="button" onPress={() => onSelectStop('pickup')} style={[styles.waypoint, styles.pickup, activeStop === 'pickup' && styles.activeWaypoint]}><Text style={styles.cap}>🎓</Text></Pressable><Pressable accessibilityLabel="Destination waypoint: Northgate, Berkeley" accessibilityRole="button" onPress={() => onSelectStop('destination')} style={[styles.waypoint, styles.destination, activeStop === 'destination' && styles.activeWaypoint]}><Text style={styles.cap}>🎓</Text></Pressable></View>;
}

const styles = StyleSheet.create({ map: { height: 260, overflow: 'hidden', borderRadius: radii.xl, backgroundColor: '#EAF1F8', position: 'relative' }, road: { position: 'absolute', height: 34, width: '145%', backgroundColor: '#D7E2EE', opacity: 0.8 }, roadOne: { left: -65, top: 72, transform: [{ rotate: '-35deg' }] }, roadTwo: { left: -75, top: 155, transform: [{ rotate: '37deg' }] }, route: { position: 'absolute', height: 7, width: '64%', left: '20%', top: '51%', borderRadius: 99, backgroundColor: colors.steel, transform: [{ rotate: '-29deg' }] }, waypoint: { alignItems: 'center', justifyContent: 'center', position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: colors.white, shadowColor: colors.navy, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }, pickup: { left: '16%', bottom: '18%' }, destination: { right: '14%', top: '16%' }, activeWaypoint: { borderColor: colors.navy, borderWidth: 3 }, cap: { fontSize: 28 } });
