import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingStatusPill } from "../components/BookingStatusPill";
import { currentUser, rides } from "../data/fixtures";
import { estimateWaypointArrivalTimes } from "../features/rides/arrivalTimes";
import { RideRouteMap } from "../features/rides/components/RideRouteMap";
import { fixtureRideSeeds } from "../features/rides/fixtures";
import { createMockMapsService } from "../features/rides/mockMapsService";
import { createSupabaseMapsService } from "../features/rides/supabaseMapsService";
import { useBookings } from "../hooks/useBookings";
import { withRouteFallback } from "../lib/maps";
import { mockBookingService } from "../services/mockBookingService";
import { colors, componentTokens, radii, semanticColors, spacing, typography } from "../theme/tokens";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatArrivalTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RideDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string | string[] }>();
  const rideId = Array.isArray(params.rideId) ? params.rideId[0] : params.rideId;
  const ride = rides.find((item) => item.id === rideId);
  const routeRide = fixtureRideSeeds.find((item) => item.id === rideId);
  const routePlaces = useMemo(() => routeRide ? [routeRide.origin, ...routeRide.stops, routeRide.destination] : [], [routeRide]);
  const mapsService = useMemo(() => withRouteFallback(createSupabaseMapsService(), createMockMapsService({ delayMs: 120 })), []);
  const [routeSummary, setRouteSummary] = useState(routeRide?.routeSummary ?? null);
  const arrivalTimes = useMemo(
    () => routeRide ? estimateWaypointArrivalTimes(routeRide.departureAt, routePlaces, routeSummary) : [],
    [routePlaces, routeRide, routeSummary],
  );
  const { riderBookings } = useBookings();
  const booking = ride ? riderBookings.find((item) => item.rideId === ride.id) : undefined;
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!ride) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.title}>Ride not found</Text>
          <Text accessibilityRole="alert" style={styles.note}>This ride may no longer be available.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Back to rides</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isDriver = ride.driverId === currentUser.id;
  const selectedRide = ride;

  async function requestSeat() {
    setSaving(true);
    setErrorMessage("");
    try {
      await mockBookingService.request(selectedRide.id, currentUser);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Couldn’t send the request. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityLabel="Back to rides"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <View>
          <Text style={styles.kicker}>RIDE DETAILS · {ride.dateLabel.toUpperCase()}</Text>
          <Text style={styles.time}>{ride.departureTime}</Text>
        </View>

        {routePlaces.length >= 2 ? (
          <RideRouteMap places={routePlaces} service={mapsService} onRouteChange={setRouteSummary} />
        ) : null}

        <View style={styles.routeCard}>
          {routePlaces.map((place, index) => {
            const isOrigin = index === 0;
            const isDestination = index === routePlaces.length - 1;
            const time = arrivalTimes[index];
            return (
              <View key={place.id} style={styles.routeRow}>
                <View style={[styles.routeDot, isOrigin && styles.originDot, isDestination && styles.destinationDot]} />
                <View style={styles.routeCopy}>
                  <Text style={styles.routeKind}>{isOrigin ? "ORIGIN" : isDestination ? "DESTINATION" : "SUGGESTED STOP"}</Text>
                  <Text style={styles.place}>{place.label}</Text>
                </View>
                {time && routeRide ? (
                  <View style={styles.routeTimeCopy}>
                    <Text style={styles.routeTimeLabel}>{isOrigin ? "Departs" : "Est. arrival"}</Text>
                    <Text style={styles.routeTime}>{formatArrivalTime(time, routeRide.displayTimezone)}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
          {arrivalTimes.length > 0 ? <Text style={styles.arrivalNote}>Arrival times are estimates and may change with traffic or stop length.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Trip summary</Text>
          <Text style={styles.body}>{ride.vehicle}</Text>
          <View style={styles.factRow}>
            <Text style={styles.factValue}>{ride.availableSeats}</Text>
            <Text style={styles.factLabel}>of {ride.totalSeats} seats available</Text>
            <Text style={styles.factValue}>{formatPrice(ride.pricePerSeat)}</Text>
            <Text style={styles.factLabel}>per seat</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Your driver</Text>
          <Text style={styles.body}>{ride.driverInitials} · {ride.driverName} · ★ {ride.driverRating}</Text>
          {ride.notes ? <Text style={styles.note}>{ride.notes}</Text> : null}
        </View>

        {booking ? (
          <View style={styles.actionCard}>
            <BookingStatusPill status={booking.status} />
            <Text style={styles.note}>
              {booking.status === "pending"
                ? `${ride.driverName} has your request. You’ll see their decision here.`
                : booking.status === "accepted"
                  ? "You’re all set. This ride is saved in My Rides."
                  : "This request is no longer active."}
            </Text>
          </View>
        ) : isDriver ? (
          <View style={styles.actionCard}>
            <Text style={styles.section}>You’re driving this ride</Text>
            <Text style={styles.note}>You can’t request your own ride. Review passenger requests instead.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push("/requests")} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Review requests</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: saving, disabled: saving || ride.availableSeats === 0 }}
            disabled={saving || ride.availableSeats === 0}
            onPress={requestSeat}
            style={({ pressed }) => [styles.primaryButton, (pressed || saving || ride.availableSeats === 0) && styles.disabled]}
          >
            {saving ? <ActivityIndicator color={semanticColors.action.primaryForeground} /> : (
              <Text style={styles.primaryText}>{ride.availableSeats === 0 ? "Ride is full" : "Request a seat"}</Text>
            )}
          </Pressable>
        )}

        {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: semanticColors.app.background, flex: 1 },
  page: { gap: spacing[4], padding: spacing[5], paddingBottom: spacing[8] },
  notFound: { alignItems: "center", flex: 1, gap: spacing[4], justifyContent: "center", padding: spacing[8] },
  backButton: { alignItems: "center", alignSelf: "flex-start", justifyContent: "center", minHeight: 44, paddingRight: spacing[4] },
  back: { color: semanticColors.text.link, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  time: { color: colors.ink, fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.heavy, marginTop: spacing[1] },
  title: { color: colors.ink, fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.heavy },
  routeCard: { backgroundColor: semanticColors.app.surface, borderColor: colors.border, borderRadius: componentTokens.card.radius, borderWidth: 1, gap: spacing[3], padding: componentTokens.card.padding },
  routeRow: { alignItems: "center", flexDirection: "row", gap: spacing[3] },
  routeDot: { backgroundColor: colors.steel, borderRadius: radii.pill, height: 8, width: 8 },
  originDot: { backgroundColor: colors.peach, height: 12, width: 12 },
  destinationDot: { backgroundColor: colors.navy, height: 12, width: 12 },
  routeCopy: { flex: 1, gap: spacing[1] },
  routeKind: { color: colors.textMuted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  place: { color: colors.ink, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  routeTimeCopy: { alignItems: "flex-end", gap: spacing[1], minWidth: 76 },
  routeTimeLabel: { color: colors.textMuted, fontSize: typography.fontSize.xs },
  routeTime: { color: colors.navy, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.heavy },
  arrivalNote: { color: colors.textMuted, fontSize: typography.fontSize.xs, lineHeight: 18, marginTop: spacing[1] },
  card: { backgroundColor: semanticColors.app.surface, borderColor: colors.border, borderRadius: componentTokens.card.radius, borderWidth: 1, gap: spacing[3], padding: componentTokens.card.padding },
  section: { color: colors.ink, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.heavy },
  body: { color: colors.text, fontSize: typography.fontSize.md, lineHeight: 23 },
  note: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 21 },
  factRow: { alignItems: "baseline", flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  factValue: { color: colors.navy, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.heavy },
  factLabel: { color: colors.textMuted, fontSize: typography.fontSize.sm, marginRight: spacing[2] },
  actionCard: { backgroundColor: colors.ice, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing[3], padding: spacing[4] },
  primaryButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: radii.md, justifyContent: "center", minHeight: 52, paddingHorizontal: spacing[5] },
  primaryText: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.heavy },
  secondaryButton: { alignItems: "center", alignSelf: "flex-start", borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.md, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[4] },
  secondaryText: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  error: { backgroundColor: semanticColors.status.dangerBackground, borderRadius: radii.sm, color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 20, padding: spacing[3] },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
});
