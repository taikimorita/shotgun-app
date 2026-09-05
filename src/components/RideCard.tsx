import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ride } from "../types/booking";

export function RideCard({ ride, onPress }: { ride: Ride; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
    <View style={styles.row}><Text style={styles.time}>{ride.dateLabel} · {ride.departureTime}</Text><Text style={styles.price}>${ride.pricePerSeat}/seat</Text></View>
    <Text style={styles.route}>{ride.origin}</Text><Text style={styles.arrow}>↓</Text><Text style={styles.route}>{ride.destination}</Text>
    <Text style={styles.meta}>{ride.driverName} · {ride.availableSeats} seat{ride.availableSeats === 1 ? "" : "s"} left</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFF", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 16, gap: 5, marginBottom: 12, padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" }, time: { color: "#374151", fontSize: 13, fontWeight: "600" }, price: { color: "#1D4ED8", fontWeight: "800" },
  route: { color: "#111827", fontSize: 16, fontWeight: "700" }, arrow: { color: "#6B7280", fontSize: 15 }, meta: { color: "#6B7280", fontSize: 13, marginTop: 4 },
});
