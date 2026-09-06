import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingStatusPill } from "../components/BookingStatusPill";
import { useBookings } from "../hooks/useBookings";
import { mockBookingService } from "../services/mockBookingService";
import { colors, componentTokens, radii, semanticColors, spacing, typography } from "../theme/tokens";

export function RequestsScreen() {
  const router = useRouter();
  const { driverRequests, loading } = useBookings();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const pending = driverRequests.filter((booking) => booking.status === "pending");

  async function decide(id: string, accepted: boolean) {
    setErrorMessage("");
    setUpdatingId(id);
    try {
      await mockBookingService.setStatus(id, accepted ? "accepted" : "declined");
    } catch {
      setErrorMessage("We couldn’t update this request. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to my rides" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>MY RIDES</Text>
            <Text style={styles.title}>Ride requests</Text>
            <Text style={styles.subtitle}>Choose who joins the rides you’re driving.</Text>
          </View>
        </View>

        {errorMessage ? <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text> : null}

        {loading ? (
          <View style={styles.stateCard}><ActivityIndicator color={semanticColors.action.primaryBackground} /><Text style={styles.stateText}>Loading requests…</Text></View>
        ) : pending.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>✓</Text></View>
            <Text style={styles.emptyTitle}>You’re all caught up</Text>
            <Text style={styles.stateText}>New passenger requests will appear here.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>Back to My Rides</Text></Pressable>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{pending.length} PENDING REQUEST{pending.length === 1 ? "" : "S"}</Text>
            {pending.map((booking) => {
              const isUpdating = updatingId === booking.id;
              const actionsDisabled = updatingId !== null;
              return (
                <View style={styles.card} key={booking.id}>
                  <View style={styles.requestRow}>
                    <View accessibilityLabel={`${booking.riderName} avatar`} style={styles.avatar}><Text style={styles.avatarText}>{booking.riderInitials}</Text></View>
                    <View style={styles.requestCopy}>
                      <Text style={styles.name}>{booking.riderName}</Text>
                      <Text style={styles.detail} numberOfLines={2}>{booking.ride.origin} → {booking.ride.destination}</Text>
                    </View>
                    <BookingStatusPill status={booking.status} />
                  </View>
                  <View style={styles.tripFacts}>
                    <View style={styles.fact}><Text style={styles.factLabel}>DEPARTS</Text><Text style={styles.factValue}>{booking.ride.departureTime}</Text></View>
                    <View style={styles.fact}><Text style={styles.factLabel}>REQUEST</Text><Text style={styles.factValue}>{booking.seats} seat</Text></View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable accessibilityRole="button" accessibilityState={{ disabled: actionsDisabled }} disabled={actionsDisabled} onPress={() => decide(booking.id, false)} style={({ pressed }) => [styles.secondaryAction, (pressed || actionsDisabled) && styles.muted]}><Text style={styles.secondaryActionText}>Decline</Text></Pressable>
                    <Pressable accessibilityRole="button" accessibilityState={{ busy: isUpdating, disabled: actionsDisabled }} disabled={actionsDisabled} onPress={() => decide(booking.id, true)} style={({ pressed }) => [styles.primaryAction, (pressed || actionsDisabled) && styles.muted]}>{isUpdating ? <ActivityIndicator color={semanticColors.action.primaryForeground} /> : <Text style={styles.primaryActionText}>Accept rider</Text>}</Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: semanticColors.app.background, flex: 1 },
  page: { flexGrow: 1, gap: spacing[5], padding: spacing[5], paddingBottom: spacing[8] },
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3] },
  backButton: { alignItems: "center", backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: radii.pill, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  backText: { color: semanticColors.text.primary, fontSize: typography.fontSize["2xl"], lineHeight: 31 },
  headerCopy: { flex: 1, gap: spacing[1] },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  title: { color: semanticColors.text.primary, fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.tight },
  subtitle: { color: semanticColors.text.muted, fontSize: typography.fontSize.sm, lineHeight: 20 },
  section: { gap: spacing[3] },
  sectionLabel: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  card: { backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: componentTokens.card.radius, borderWidth: 1, gap: spacing[4], padding: spacing[4] },
  requestRow: { alignItems: "center", flexDirection: "row", gap: spacing[3] },
  avatar: { alignItems: "center", backgroundColor: colors.steelSoft, borderRadius: radii.pill, height: 48, justifyContent: "center", width: 48 },
  avatarText: { color: semanticColors.text.primary, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.heavy },
  requestCopy: { flex: 1, minWidth: 0 },
  name: { color: semanticColors.text.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.heavy },
  detail: { color: semanticColors.text.muted, fontSize: typography.fontSize.sm, lineHeight: 19, marginTop: spacing[1] },
  tripFacts: { backgroundColor: semanticColors.app.surfaceMuted, borderRadius: radii.md, flexDirection: "row", padding: spacing[3] },
  fact: { flex: 1, gap: spacing[1] },
  factLabel: { color: semanticColors.text.muted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  factValue: { color: semanticColors.text.primary, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  actions: { flexDirection: "row", gap: spacing[3] },
  primaryAction: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: radii.md, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[4] },
  primaryActionText: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  secondaryAction: { alignItems: "center", backgroundColor: semanticColors.action.secondaryBackground, borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.md, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[4] },
  secondaryActionText: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  stateCard: { alignItems: "center", backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: componentTokens.card.radius, borderWidth: 1, gap: spacing[3], padding: spacing[8] },
  emptyIcon: { alignItems: "center", backgroundColor: semanticColors.status.successBackground, borderRadius: radii.pill, height: 52, justifyContent: "center", width: 52 },
  emptyIconText: { color: semanticColors.status.successForeground, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy },
  emptyTitle: { color: semanticColors.text.primary, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  stateText: { color: semanticColors.text.muted, fontSize: typography.fontSize.sm, lineHeight: 21, textAlign: "center" },
  secondaryButton: { alignItems: "center", borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.md, borderWidth: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[5] },
  secondaryText: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  errorText: { backgroundColor: semanticColors.status.dangerBackground, borderRadius: radii.md, color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 20, padding: spacing[3] },
  pressed: { opacity: 0.72 },
  muted: { opacity: 0.55 },
});
