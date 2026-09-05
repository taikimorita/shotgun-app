import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookingStatusPill } from "../components/BookingStatusPill";
import { currentUser, rides } from "../data/fixtures";
import { useBookings } from "../hooks/useBookings";
import { mockBookingService } from "../services/mockBookingService";

export function RideDetailsScreen() {
  const router = useRouter();
  const { rideId = "ride-slo-sf" } = useLocalSearchParams<{ rideId: string }>();
  const ride = rides.find((item) => item.id === rideId) ?? rides[0];
  const { riderBookings } = useBookings();
  const booking = riderBookings.find((item) => item.rideId === ride.id);
  const [saving, setSaving] = useState(false);
  const isDriver = ride.driverId === currentUser.id;

  async function requestSeat() {
    setSaving(true);
    try { await mockBookingService.request(ride.id, currentUser); }
    catch (error) { Alert.alert("Couldn’t send request", error instanceof Error ? error.message : "Try again."); }
    finally { setSaving(false); }
  }

  return <ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.kicker}>{ride.dateLabel} · {ride.departureTime}</Text>
    <Text style={styles.title}>{ride.origin}</Text><Text style={styles.arrow}>↓</Text><Text style={styles.title}>{ride.destination}</Text>
    <View style={styles.card}><Text style={styles.section}>Ride details</Text><Text style={styles.body}>{ride.vehicle}</Text><Text style={styles.body}>{ride.availableSeats} of {ride.totalSeats} seats available · ${ride.pricePerSeat} per seat</Text></View>
    <View style={styles.card}><Text style={styles.section}>Your driver</Text><Text style={styles.body}>{ride.driverInitials} · {ride.driverName} · ★ {ride.driverRating}</Text><Text style={styles.note}>{ride.notes}</Text></View>
    {booking ? <View style={styles.action}><BookingStatusPill status={booking.status} /><Text style={styles.note}>{booking.status === "pending" ? "Jordan will be notified. You’ll see their decision here." : booking.status === "accepted" ? "You’re all set. Find this ride in Upcoming." : "This request is no longer active."}</Text></View>
      : isDriver ? <View style={styles.action}><Text style={styles.note}>This is your ride. Review passenger requests in Requests.</Text></View>
      : <Pressable disabled={saving || ride.availableSeats === 0} onPress={requestSeat} style={[styles.primary, (saving || ride.availableSeats === 0) && styles.disabled]}><Text style={styles.primaryText}>{saving ? "Sending request…" : ride.availableSeats === 0 ? "Ride is full" : "Request a seat"}</Text></Pressable>}
  </ScrollView>;
}

const styles = StyleSheet.create({ page: { backgroundColor: "#F9FAFB", flexGrow: 1, gap: 16, padding: 20, paddingTop: 64 }, back: { color: "#1D4ED8", fontSize: 16, fontWeight: "700" }, kicker: { color: "#6B7280", fontWeight: "700" }, title: { color: "#111827", fontSize: 24, fontWeight: "800" }, arrow: { color: "#6B7280", fontSize: 20 }, card: { backgroundColor: "#FFF", borderRadius: 16, gap: 10, padding: 16 }, section: { color: "#111827", fontSize: 17, fontWeight: "800" }, body: { color: "#374151", fontSize: 15, lineHeight: 22 }, note: { color: "#6B7280", fontSize: 14, lineHeight: 20 }, action: { backgroundColor: "#EFF6FF", borderRadius: 16, gap: 10, padding: 16 }, primary: { alignItems: "center", backgroundColor: "#1D4ED8", borderRadius: 14, padding: 16 }, primaryText: { color: "#FFF", fontSize: 16, fontWeight: "800" }, disabled: { opacity: 0.5 } });
