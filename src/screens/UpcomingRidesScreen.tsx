import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { BookingStatusPill } from "../components/BookingStatusPill";
import { RideCard } from "../components/RideCard";
import { useBookings } from "../hooks/useBookings";

export function UpcomingRidesScreen() {
  const router = useRouter();
  const { riderBookings, loading } = useBookings();
  const active = riderBookings.filter((booking) => booking.status === "accepted" || booking.status === "pending");
  return <ScrollView contentContainerStyle={styles.page}><View style={styles.header}><View><Text style={styles.title}>Your rides</Text><Text style={styles.subtitle}>Upcoming trips and requests</Text></View><Pressable onPress={() => router.push("/requests")}><Text style={styles.link}>Requests</Text></Pressable></View>
    <Pressable accessibilityRole="button" onPress={() => router.push("/create" as Href)} style={styles.create}><Text style={styles.createText}>Post a ride</Text></Pressable>
    {loading ? <Text>Loading rides…</Text> : active.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No upcoming rides</Text><Text style={styles.subtitle}>Browse rides to request a seat.</Text><Pressable style={styles.primary} onPress={() => router.push("/rides/ride-slo-sf")}><Text style={styles.primaryText}>View a demo ride</Text></Pressable></View> : active.map((booking) => <View key={booking.id}><RideCard ride={booking.ride} onPress={() => router.push(`/rides/${booking.rideId}`)} /><View style={styles.status}><BookingStatusPill status={booking.status} /></View></View>)}
    <Pressable onPress={() => router.push("/rides/ride-slo-sb")} style={styles.browse}><Text style={styles.browseText}>Browse a demo ride →</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({ page: { backgroundColor: "#F9FAFB", flexGrow: 1, gap: 12, padding: 20, paddingTop: 64 }, header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }, title: { color: "#111827", fontSize: 28, fontWeight: "800" }, subtitle: { color: "#6B7280", marginTop: 4 }, link: { color: "#1D4ED8", fontWeight: "800", paddingTop: 8 }, create: { alignItems: "center", backgroundColor: "#102A43", borderRadius: 16, justifyContent: "center", minHeight: 52, paddingHorizontal: 18 }, createText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" }, status: { marginLeft: 12, marginTop: -24 }, empty: { alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, gap: 10, marginTop: 16, padding: 30 }, emptyTitle: { color: "#111827", fontSize: 17, fontWeight: "800" }, primary: { backgroundColor: "#1D4ED8", borderRadius: 10, marginTop: 8, paddingHorizontal: 16, paddingVertical: 12 }, primaryText: { color: "#FFF", fontWeight: "800" }, browse: { alignItems: "center", borderColor: "#BFDBFE", borderRadius: 12, borderWidth: 1, marginTop: 4, padding: 14 }, browseText: { color: "#1D4ED8", fontWeight: "800" } });
