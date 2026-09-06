import { Image, Pressable, StyleSheet, View } from 'react-native';

import { radii } from '@/src/theme/tokens';

type Props = { activeStop: 'pickup' | 'destination'; onSelectStop: (stop: 'pickup' | 'destination') => void };

export function MapCanvas({ activeStop, onSelectStop }: Props) {
  return <View accessibilityLabel="Route map from Sproul Plaza to Northgate, Berkeley" style={styles.map}><Image resizeMode="cover" source={require('./map-route-reference.png')} style={styles.art} /><Pressable accessibilityLabel="Pickup waypoint: Sproul Plaza" accessibilityRole="button" onPress={() => onSelectStop('pickup')} style={[styles.waypoint, styles.pickup, activeStop === 'pickup' && styles.activeWaypoint]} /><Pressable accessibilityLabel="Destination waypoint: Northgate, Berkeley" accessibilityRole="button" onPress={() => onSelectStop('destination')} style={[styles.waypoint, styles.destination, activeStop === 'destination' && styles.activeWaypoint]} /></View>;
}

const styles = StyleSheet.create({ map: { height: 260, overflow: 'hidden', borderRadius: radii.xl, position: 'relative' }, art: { height: '100%', width: '100%' }, waypoint: { position: 'absolute', width: 70, height: 70, borderRadius: 35 }, pickup: { left: '15%', bottom: '13%' }, destination: { right: '12%', top: '11%' }, activeWaypoint: { borderColor: '#102A43', borderWidth: 3 } });
