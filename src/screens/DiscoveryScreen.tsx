import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DiscoveryFilterValues,
  emptyDiscoveryFilters,
  isRideRequestable,
  validateAndBuildRideFilters,
} from "../features/rides/discovery";
import { DiscoveryMapHeader } from "../features/rides/components/DiscoveryMapHeader";
import { RideCard } from "../features/rides/components/RideCard";
import { RideFilters } from "../features/rides/components/RideFilters";
import { calPoly, fixtureNowIso, sfo } from "../features/rides/fixtures";
import { createMockMapsService } from "../features/rides/mockMapsService";
import { createSupabaseMapsService } from "../features/rides/supabaseMapsService";
import { fixtureRidesService } from "../features/rides/service";
import { MapsService, withMapsFallback } from "../lib/maps";
import { expoLocationService, LocationService } from "../lib/location";
import { Place, Ride, RideFilters as RideFilterQuery, RidesService } from "../features/rides/types";
import { currentUser } from "../data/fixtures";
import { colors, radii, semanticColors, spacing, typography } from "../theme/tokens";

type DiscoveryScreenProps = {
  ridesService?: Pick<RidesService, "list">;
  mapsService?: MapsService;
  locationService?: LocationService;
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

export function DiscoveryScreen({ ridesService = fixtureRidesService, mapsService: mapsServiceProp, locationService = expoLocationService, now = fixtureNowIso }: DiscoveryScreenProps) {
  const router = useRouter();
  const mapsService = useMemo(() => {
    if (mapsServiceProp) return mapsServiceProp;
    const fallback = createMockMapsService({ delayMs: 120 });
    return withMapsFallback(createSupabaseMapsService(), fallback);
  }, [mapsServiceProp]);
  const [draft, setDraft] = useState<DiscoveryFilterValues>({ ...emptyDiscoveryFilters });
  const [applied, setApplied] = useState<DiscoveryFilterValues>({ ...emptyDiscoveryFilters });
  const [query, setQuery] = useState<RideFilterQuery>({});
  const [pickup, setPickup] = useState<Place | null>({ ...calPoly });
  const [destination, setDestination] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof DiscoveryFilterValues, string>>>({});
  const [rides, setRides] = useState<Ride[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [locationState, setLocationState] = useState<{ status: "idle" | "loading" | "error"; error: string }>({ status: "idle", error: "" });

  useEffect(() => {
    let active = true;
    ridesService
      .list(query)
      .then((next) => {
        if (!active) return;
        setRides(next);
        setLoadError("");
        setLoadState("ready");
        setIsApplying(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Rides are temporarily unavailable.");
        setLoadState("error");
        setIsApplying(false);
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
    setIsApplying(true);
    setLoadState("loading");
    setQuery(result.filters);
  }

  function clear() {
    const next = {
      ...emptyDiscoveryFilters,
      destinationQuery: destination?.label ?? "",
    };
    const result = validateAndBuildRideFilters(next);
    setDraft(next);
    setApplied(next);
    setErrors({});
    setIsApplying(true);
    setLoadState("loading");
    setQuery(result.ok ? result.filters : {});
  }

  function retry() {
    setIsApplying(true);
    setLoadState("loading");
    setRefreshKey((key) => key + 1);
  }

  function viewRides() {
    apply({
      ...draft,
      destinationQuery: destination?.label ?? draft.destinationQuery,
    });
  }

  function useDemoPreset() {
    setPickup({ ...calPoly });
    setLocationState({ status: "idle", error: "" });
    setDestination({ ...sfo });
    apply(demoFilters);
  }

  function changePickup(place: Place | null) {
    setPickup(place);
    setLocationState({ status: "idle", error: "" });
  }

  async function useCurrentLocation() {
    setLocationState({ status: "loading", error: "" });
    try {
      setPickup(await locationService.getCurrentPlace());
      setLocationState({ status: "idle", error: "" });
    } catch (error) {
      setLocationState({ status: "error", error: error instanceof Error ? error.message : "Couldn’t get your current location." });
    }
  }

  const filtered = hasFilters(applied);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <DiscoveryMapHeader
          destination={destination}
          disabled={isApplying}
          locationError={locationState.error}
          locationStatus={locationState.status}
          mapsService={mapsService}
          onDestinationChange={setDestination}
          onPickupChange={changePickup}
          onUseCurrentLocation={useCurrentLocation}
          onViewRides={viewRides}
          pickup={pickup}
          rides={rides}
          viewRidesDisabled={isApplying || !destination}
          viewRidesLoading={isApplying}
        />

        <RideFilters
          value={draft}
          errors={errors}
          disabled={isApplying}
          applied={filtered}
          onChange={setDraft}
          onApply={() => apply(draft)}
          onClear={clear}
        />

        <Pressable accessibilityRole="button" disabled={isApplying} onPress={useDemoPreset} style={({ pressed }) => [styles.demoButton, (pressed || isApplying) && styles.buttonMuted]}>
          <Text style={styles.demoButtonText}>Try tomorrow · SFO · 2 seats</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{filtered ? "Matching rides" : "Upcoming rides"}</Text>
            <Text style={styles.sectionSubtitle}>{loadState === "ready" ? `${rides.length} ride${rides.length === 1 ? "" : "s"} found` : "Finding the best options"}</Text>
          </View>
          <Pressable accessibilityRole="button" disabled={isApplying} onPress={retry} style={({ pressed }) => [styles.refreshButton, (pressed || isApplying) && styles.buttonMuted]}>
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
            <RideCard
              key={ride.id}
              onPress={() => router.push(`/rides/${ride.id}` as Href)}
              ride={ride}
              requestable={isRideRequestable(ride, now) && ride.driver.id !== currentUser.id}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: semanticColors.app.background, flex: 1 },
  page: { gap: spacing[3], padding: spacing[5], paddingBottom: spacing[8] },
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
  buttonMuted: { opacity: 0.55 },
});
