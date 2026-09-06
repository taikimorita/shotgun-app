import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DiscoveryFilterValues,
  emptyDiscoveryFilters,
  isRideRequestable,
  validateAndBuildRideFilters,
} from "../features/rides/discovery";
import { RideCard } from "../features/rides/components/RideCard";
import { RideFilters } from "../features/rides/components/RideFilters";
import { fixtureNowIso } from "../features/rides/fixtures";
import { fixtureRidesService } from "../features/rides/service";
import { Ride, RideFilters as RideFilterQuery, RidesService } from "../features/rides/types";
import { colors, radii, semanticColors, spacing, typography } from "../theme/tokens";

type DiscoveryScreenProps = {
  ridesService?: Pick<RidesService, "list">;
  now?: Date | string;
};

type LoadState = "loading" | "ready" | "error";

const demoFilters: DiscoveryFilterValues = {
  destinationQuery: "SFO",
  departureDate: "2026-09-06",
  maxPriceDollars: "",
  minimumRemainingSeats: "2",
};

function hasFilters(value: DiscoveryFilterValues) {
  return Object.values(value).some((entry) => entry.trim().length > 0);
}

export function DiscoveryScreen({ ridesService = fixtureRidesService, now = fixtureNowIso }: DiscoveryScreenProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<DiscoveryFilterValues>({ ...emptyDiscoveryFilters });
  const [applied, setApplied] = useState<DiscoveryFilterValues>({ ...emptyDiscoveryFilters });
  const [query, setQuery] = useState<RideFilterQuery>({});
  const [errors, setErrors] = useState<Partial<Record<keyof DiscoveryFilterValues, string>>>({});
  const [rides, setRides] = useState<Ride[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    ridesService
      .list(query)
      .then((next) => {
        if (!active) return;
        setRides(next);
        setLoadError("");
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Rides are temporarily unavailable.");
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [query, refreshKey, ridesService]);

  function apply(next: DiscoveryFilterValues) {
    const result = validateAndBuildRideFilters(next);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setDraft(next);
    setApplied(next);
    setErrors({});
    setLoadState("loading");
    setQuery(result.filters);
  }

  function clear() {
    const empty = { ...emptyDiscoveryFilters };
    setDraft(empty);
    setApplied(empty);
    setErrors({});
    setLoadState("loading");
    setQuery({});
  }

  function retry() {
    setLoadState("loading");
    setRefreshKey((key) => key + 1);
  }

  const filtered = hasFilters(applied);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>SHOTGUN</Text>
            <Text style={styles.brandSub}>Cal Poly ride board</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/upcoming" as Href)} style={styles.topAction}>
            <Text style={styles.topActionText}>My rides</Text>
          </Pressable>
        </View>

        <View accessibilityLabel="Route search illustration from Cal Poly" accessibilityRole="image" style={styles.mapCard}>
          <View style={[styles.road, styles.roadOne]} />
          <View style={[styles.road, styles.roadTwo]} />
          <View style={styles.routeLine} />
          <View style={[styles.marker, styles.originMarker]}><Text style={styles.markerText}>C</Text></View>
          <View style={[styles.marker, styles.destinationMarker]}><Text style={styles.markerText}>?</Text></View>
          <View style={styles.mapCopy}>
            <Text style={styles.mapEyebrow}>Leaving campus</Text>
            <Text style={styles.mapTitle}>Where do you need to go?</Text>
          </View>
        </View>

        <RideFilters
          value={draft}
          errors={errors}
          disabled={loadState === "loading"}
          applied={filtered}
          onChange={setDraft}
          onApply={() => apply(draft)}
          onClear={clear}
        />

        <Pressable accessibilityRole="button" onPress={() => apply(demoFilters)} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Try tomorrow · SFO · 2 seats</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{filtered ? "Matching rides" : "Upcoming rides"}</Text>
            <Text style={styles.sectionSubtitle}>{loadState === "ready" ? `${rides.length} ride${rides.length === 1 ? "" : "s"} found` : "Finding the best options"}</Text>
          </View>
          <Pressable accessibilityRole="button" disabled={loadState === "loading"} onPress={retry} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        {loadState === "loading" ? (
          <View style={styles.stateCard}><ActivityIndicator color={semanticColors.action.primaryBackground} /><Text style={styles.stateText}>Loading rides…</Text></View>
        ) : loadState === "error" ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Couldn’t load rides</Text>
            <Text accessibilityRole="alert" style={styles.stateText}>{loadError}</Text>
            <Pressable accessibilityRole="button" onPress={retry} style={styles.primaryButton}><Text style={styles.primaryText}>Try again</Text></Pressable>
          </View>
        ) : rides.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>{filtered ? "No rides match yet" : "No upcoming rides"}</Text>
            <Text style={styles.stateText}>{filtered ? "Clear a filter or try another destination." : "Be the first student to post a ride."}</Text>
            {filtered ? <Pressable accessibilityRole="button" onPress={clear} style={styles.primaryButton}><Text style={styles.primaryText}>Clear filters</Text></Pressable> : null}
          </View>
        ) : (
          rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} requestable={isRideRequestable(ride, now)} />
          ))
        )}

        <Pressable accessibilityRole="button" onPress={() => router.push("/create" as Href)} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post a ride</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/requests" as Href)} style={styles.requestsButton}>
          <Text style={styles.requestsText}>Review passenger requests</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: semanticColors.app.background, flex: 1 },
  page: { gap: spacing[4], padding: spacing[5], paddingBottom: spacing[12] },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  brand: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.label },
  brandSub: { color: colors.textMuted, fontSize: typography.fontSize.xs, marginTop: spacing[1] },
  topAction: { alignItems: "center", borderColor: semanticColors.app.borderStrong, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[4] },
  topActionText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  mapCard: { backgroundColor: colors.ice, borderColor: semanticColors.app.border, borderRadius: radii.xl, borderWidth: 1, height: 220, overflow: "hidden", position: "relative" },
  road: { backgroundColor: colors.white, height: 28, opacity: 0.75, position: "absolute", width: 330 },
  roadOne: { left: -55, top: 55, transform: [{ rotate: "-27deg" }] },
  roadTwo: { right: -80, top: 145, transform: [{ rotate: "18deg" }] },
  routeLine: { backgroundColor: colors.steel, height: 6, left: "25%", position: "absolute", top: 88, transform: [{ rotate: "-14deg" }], width: "52%" },
  marker: { alignItems: "center", borderColor: colors.white, borderRadius: radii.pill, borderWidth: 4, height: 48, justifyContent: "center", position: "absolute", width: 48 },
  originMarker: { backgroundColor: colors.steel, bottom: 86, left: "18%" },
  destinationMarker: { backgroundColor: colors.peach, right: "16%", top: 26 },
  markerText: { color: colors.white, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.heavy },
  mapCopy: { bottom: spacing[4], left: spacing[4], position: "absolute" },
  mapEyebrow: { color: colors.textMuted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label, textTransform: "uppercase" },
  mapTitle: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, marginTop: spacing[1] },
  demoButton: { alignItems: "center", borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[4] },
  demoButtonText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy },
  sectionSubtitle: { color: colors.textMuted, fontSize: typography.fontSize.sm, marginTop: spacing[1] },
  refreshButton: { justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[2] },
  refreshText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  stateCard: { alignItems: "center", backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing[3], padding: spacing[8] },
  stateText: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 21, textAlign: "center" },
  errorTitle: { color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  emptyTitle: { color: colors.ink, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  primaryButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: radii.md, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[5] },
  primaryText: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  postButton: { alignItems: "center", backgroundColor: semanticColors.action.accentBackground, borderRadius: radii.lg, justifyContent: "center", minHeight: 56, paddingHorizontal: spacing[5] },
  postButtonText: { color: semanticColors.action.accentForeground, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.heavy },
  requestsButton: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  requestsText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
});
