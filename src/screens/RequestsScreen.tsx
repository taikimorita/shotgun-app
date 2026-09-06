import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookingStatusPill } from "../components/BookingStatusPill";
import { useBookings } from "../hooks/useBookings";
import { mockBookingService } from "../services/mockBookingService";

export function RequestsScreen() {
  const router = useRouter();
  const { driverRequests, loading } = useBookings();
  const pending = driverRequests.filter((booking) => booking.status === "pending");
  async function decide(id: string, accepted: boolean) { try { await mockBookingService.setStatus(id, accepted ? "accepted" : "declined"); } catch { Alert.alert("Couldn’t update request", "Please try again."); } }
  return <ScrollView contentContainerStyle={styles.page}><Text style={styles.title}>Passenger requests</Text><Text style={styles.subtitle}>Review requests for rides you’re driving.</Text>
    {loading ? <Text>Loading requests…</Text> : pending.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No pending requests</Text><Text style={styles.subtitle}>New passenger requests will appear here.</Text></View> : pending.map((booking) => <View style={styles.card} key={booking.id}>
      <View style={styles.row}><View><Text style={styles.name}>{booking.riderInitials} · {booking.riderName}</Text><Text style={styles.detail}>Requested {booking.seats} seat for {booking.ride.destination}</Text></View><BookingStatusPill status={booking.status} /></View>
      <View style={styles.actions}><Pressable onPress={() => decide(booking.id, false)} style={styles.secondary}><Text style={styles.secondaryText}>Decline</Text></Pressable><Pressable onPress={() => decide(booking.id, true)} style={styles.primary}><Text style={styles.primaryText}>Accept</Text></Pressable></View>
    </View>)}
    <Pressable onPress={() => router.push("/rides/ride-slo-la")}><Text style={styles.link}>View your ride details</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({ page: { backgroundColor: "#F9FAFB", flexGrow: 1, gap: 14, padding: 20, paddingTop: 64 }, title: { color: "#111827", fontSize: 28, fontWeight: "800" }, subtitle: { color: "#6B7280", lineHeight: 20 }, card: { backgroundColor: "#FFF", borderRadius: 16, gap: 16, padding: 16 }, row: { flexDirection: "row", gap: 12, justifyContent: "space-between" }, name: { color: "#111827", fontSize: 16, fontWeight: "800" }, detail: { color: "#6B7280", marginTop: 5 }, actions: { flexDirection: "row", gap: 10 }, primary: { alignItems: "center", backgroundColor: "#1D4ED8", borderRadius: 10, flex: 1, padding: 12 }, primaryText: { color: "#FFF", fontWeight: "800" }, secondary: { alignItems: "center", borderColor: "#D1D5DB", borderRadius: 10, borderWidth: 1, flex: 1, padding: 12 }, secondaryText: { color: "#374151", fontWeight: "800" }, empty: { alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, gap: 8, padding: 28 }, emptyTitle: { color: "#111827", fontSize: 17, fontWeight: "800" }, link: { color: "#1D4ED8", fontWeight: "700", marginTop: 8 } });
