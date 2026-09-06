import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingStatusPill } from "../components/BookingStatusPill";
import { RideCard } from "../components/RideCard";
import { useBookings } from "../hooks/useBookings";
import { colors, componentTokens, radii, semanticColors, spacing, typography } from "../theme/tokens";

export function UpcomingRidesScreen() {
  const router = useRouter();
  const { riderBookings, loading } = useBookings();
  const active = riderBookings.filter((booking) => booking.status === "accepted" || booking.status === "pending");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>MY RIDES</Text>
            <Text style={styles.title}>Your trips</Text>
            <Text style={styles.subtitle}>Upcoming rides and seat requests.</Text>
          </View>
          <Pressable
            accessibilityLabel="Review passenger requests"
            accessibilityRole="button"
            onPress={() => router.push("/requests")}
            style={({ pressed }) => [styles.requestsButton, pressed && styles.pressed]}
          >
            <Text style={styles.requestsText}>Requests</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={semanticColors.action.primaryBackground} />
            <Text style={styles.stateText}>Loading your rides…</Text>
          </View>
        ) : active.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>No upcoming rides</Text>
            <Text style={styles.stateText}>Find a ride and request a seat to see it here.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push("/")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>Find a ride</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.section}>
            <View>
              <Text style={styles.sectionTitle}>Upcoming trips</Text>
              <Text style={styles.sectionSubtitle}>{active.length} active ride{active.length === 1 ? "" : "s"}</Text>
            </View>
            {active.map((booking) => (
              <View key={booking.id} style={styles.booking}>
                <View style={styles.statusRow}>
                  <BookingStatusPill status={booking.status} />
                  <Text style={styles.statusHint}>{booking.status === "accepted" ? "Seat confirmed" : "Waiting for driver"}</Text>
                </View>
                <RideCard ride={booking.ride} onPress={() => router.push(`/rides/${booking.rideId}`)} />
              </View>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/rides/ride-jordan-slo-la")}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Preview another available ride</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: semanticColors.app.background, flex: 1 },
  page: { flexGrow: 1, gap: spacing[5], padding: spacing[5], paddingBottom: spacing[8] },
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3], justifyContent: "space-between" },
  headerCopy: { flex: 1 },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  title: { color: colors.ink, fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.tight, marginTop: spacing[1] },
  subtitle: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 20, marginTop: spacing[1] },
  requestsButton: { alignItems: "center", borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[4] },
  requestsText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  section: { gap: spacing[3] },
  sectionTitle: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy },
  sectionSubtitle: { color: colors.textMuted, fontSize: typography.fontSize.sm, marginTop: spacing[1] },
  booking: { gap: spacing[2] },
  statusRow: { alignItems: "center", flexDirection: "row", gap: spacing[2], paddingHorizontal: spacing[1] },
  statusHint: { color: colors.textMuted, fontSize: typography.fontSize.xs },
  stateCard: { alignItems: "center", backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: componentTokens.card.radius, borderWidth: 1, gap: spacing[3], padding: spacing[8] },
  emptyTitle: { color: colors.ink, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  stateText: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 21, textAlign: "center" },
  primaryButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: radii.md, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[5] },
  primaryText: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  secondaryButton: { alignItems: "center", borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.md, borderWidth: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[4] },
  secondaryText: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  pressed: { opacity: 0.72 },
});
