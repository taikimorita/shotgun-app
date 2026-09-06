import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RideForm } from "../features/rides/components/RideForm";
import { createMockMapsService } from "../features/rides/mockMapsService";
import { createSupabaseMapsService } from "../features/rides/supabaseMapsService";
import { fixtureRidesService } from "../features/rides/service";
import { DriverSummary, Ride, VehicleSummary } from "../features/rides/types";
import { fixtureNowIso, mayaDriver } from "../features/rides/fixtures";
import { colors, componentTokens, radii, semanticColors, spacing, typography } from "../theme/tokens";
import { withRouteFallback } from "../lib/maps";

type CreateRideScreenProps = {
  onCancel?: () => void;
  onCreateAnother?: () => void;
  onPublished?: (ride: Ride) => void;
};

const mayaVehicle: VehicleSummary = {
  id: "vehicle-maya-outback",
  label: "2022 Subaru Outback · Blue",
  seatCount: 3,
};

type DependencyState =
  | { status: "loading" }
  | { status: "ready"; driver: DriverSummary; vehicle: VehicleSummary }
  | { status: "error"; message: string };

function initializeDriverDependencies(): Promise<{ driver: DriverSummary; vehicle: VehicleSummary }> {
  return Promise.resolve().then(() => {
    if (!mayaDriver.id || !mayaDriver.name || !mayaVehicle.id || !mayaVehicle.label) {
      throw new Error("Your driver profile or vehicle is incomplete.");
    }

    return {
      driver: { ...mayaDriver },
      vehicle: { ...mayaVehicle },
    };
  });
}

function formatScheduledTime(ride: Ride) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: ride.displayTimezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(ride.departureAt));
  } catch {
    return new Date(ride.departureAt).toLocaleString();
  }
}

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

function DependencyLoading() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerState}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator color={semanticColors.action.primaryBackground} />
        </View>
        <Text style={styles.stateTitle}>Getting your driver details ready</Text>
        <Text style={styles.stateBody}>We’re loading your verified profile and vehicle.</Text>
      </View>
    </SafeAreaView>
  );
}

function DependencyError({ message, onRetry, onCancel }: { message: string; onRetry: () => void; onCancel?: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerState}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.stateTitle}>We couldn’t load your vehicle</Text>
        <Text accessibilityRole="alert" style={styles.errorBody}>
          {message} Try again to continue posting your ride.
        </Text>
        <Pressable
          accessibilityLabel="Retry loading driver profile and vehicle"
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
        {onCancel ? (
          <Pressable
            accessibilityLabel="Leave create ride"
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.secondaryButtonText}>Back to rides</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function PublishedConfirmation({ ride, onCreateAnother, onCancel }: { ride: Ride; onCreateAnother: () => void; onCancel?: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.confirmationPage}>
        <View style={styles.successMark}>
          <Text accessibilityLabel="Published successfully" style={styles.successMarkText}>
            ✓
          </Text>
        </View>
        <Text style={styles.confirmationEyebrow}>Ride published</Text>
        <Text style={styles.confirmationTitle}>Your shotgun is on the road.</Text>
        <Text style={styles.confirmationBody}>
          Students can now find your scheduled ride and request one of the open seats.
        </Text>

        <View style={styles.routeCard}>
          <View style={styles.routeMapStrip} accessibilityLabel="Route preview from origin to destination" accessibilityRole="image">
            <View style={styles.routePin} />
            <View style={styles.routeLine} />
            <View style={[styles.routePin, styles.destinationPin]} />
          </View>
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>Route</Text>
            <Text style={styles.routeValue}>{ride.origin.label}</Text>
            {ride.stops.length > 0 ? <Text style={styles.routeStop}>via {ride.stops.map((stop) => stop.label).join(" · ")}</Text> : null}
            <Text style={styles.routeArrow}>↓</Text>
            <Text style={styles.routeValue}>{ride.destination.label}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Scheduled</Text>
            <Text style={styles.detailValue}>{formatScheduledTime(ride)}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Open seats</Text>
            <Text style={styles.detailValue}>{ride.remainingSeats}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Per seat</Text>
            <Text style={styles.detailValue}>{formatPrice(ride.priceCents)}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Price source</Text>
            <Text style={styles.detailValue}>{ride.priceSource === "suggested" ? "Suggested" : "Driver set"}</Text>
          </View>
        </View>

        <View style={styles.nextStepCard}>
          <Text style={styles.nextStepTitle}>What happens next</Text>
          <Text style={styles.nextStepBody}>We’ll show you requests here as students ask for a seat. You stay in control of who joins.</Text>
        </View>

        <Pressable
          accessibilityLabel="Create another ride"
          accessibilityRole="button"
          onPress={onCreateAnother}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>Create another ride</Text>
        </Pressable>
        {onCancel ? (
          <Pressable
            accessibilityLabel="View my rides"
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.secondaryButtonText}>View my rides</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export function CreateRideScreen({ onCancel, onCreateAnother, onPublished }: CreateRideScreenProps) {
  const mapsService = useMemo(
    () => withRouteFallback(createSupabaseMapsService(), createMockMapsService({ delayMs: 120 })),
    [],
  );
  const [dependencyAttempt, setDependencyAttempt] = useState(0);
  const [dependency, setDependency] = useState<DependencyState>({ status: "loading" });
  const [publishedRide, setPublishedRide] = useState<Ride | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    let active = true;
    initializeDriverDependencies()
      .then((ready) => {
        if (active) {
          setDependency({ status: "ready", ...ready });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setDependency({
            status: "error",
            message: error instanceof Error ? error.message : "Your driver details are temporarily unavailable.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [dependencyAttempt]);

  function handlePublished(ride: Ride) {
    setPublishedRide(ride);
    onPublished?.(ride);
  }

  function createAnotherRide() {
    setPublishedRide(null);
    setFormVersion((version) => version + 1);
    onCreateAnother?.();
  }

  if (dependency.status === "loading") {
    return <DependencyLoading />;
  }

  if (dependency.status === "error") {
    return <DependencyError message={dependency.message} onRetry={() => {
      setDependency({ status: "loading" });
      setDependencyAttempt((attempt) => attempt + 1);
    }} onCancel={onCancel} />;
  }

  if (publishedRide) {
    return <PublishedConfirmation ride={publishedRide} onCreateAnother={createAnotherRide} onCancel={onCancel} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {onCancel ? (
        <Pressable
          accessibilityLabel="Back to rides"
          accessibilityRole="button"
          onPress={onCancel}
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.backButtonText}>← My rides</Text>
        </Pressable>
      ) : null}
      <RideForm
        key={formVersion}
        driver={dependency.driver}
        vehicle={dependency.vehicle}
        ridesService={fixtureRidesService}
        mapsService={mapsService}
        now={fixtureNowIso}
        onPublished={handlePublished}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: semanticColors.app.background,
    flex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing[4],
  },
  backButtonText: {
    color: semanticColors.text.link,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  centerState: {
    alignItems: "center",
    flex: 1,
    gap: spacing[3],
    justifyContent: "center",
    padding: spacing[8],
  },
  loadingIcon: {
    alignItems: "center",
    backgroundColor: semanticColors.action.accentBackground,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  errorIcon: {
    alignItems: "center",
    backgroundColor: semanticColors.status.dangerBackground,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  errorIconText: {
    color: semanticColors.status.dangerForeground,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
  },
  stateTitle: {
    color: colors.ink,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  stateBody: {
    color: semanticColors.text.secondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    maxWidth: 320,
    textAlign: "center",
  },
  errorBody: {
    color: semanticColors.status.dangerForeground,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    maxWidth: 340,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: semanticColors.action.primaryBackground,
    borderRadius: componentTokens.button.radius,
    justifyContent: "center",
    minHeight: componentTokens.button.height,
    paddingHorizontal: componentTokens.button.horizontalPadding,
    width: "100%",
  },
  primaryButtonText: {
    color: semanticColors.action.primaryForeground,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: semanticColors.action.secondaryBackground,
    borderColor: semanticColors.action.secondaryBorder,
    borderRadius: componentTokens.button.radius,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: componentTokens.button.height,
    paddingHorizontal: componentTokens.button.horizontalPadding,
    width: "100%",
  },
  secondaryButtonText: {
    color: semanticColors.action.secondaryForeground,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  confirmationPage: {
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[5],
    paddingBottom: spacing[12],
    paddingTop: spacing[8],
  },
  successMark: {
    alignItems: "center",
    backgroundColor: semanticColors.status.successBackground,
    borderColor: semanticColors.status.successForeground,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  successMarkText: {
    color: semanticColors.status.successForeground,
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.heavy,
  },
  confirmationEyebrow: {
    color: semanticColors.status.successForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  confirmationTitle: {
    color: colors.ink,
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: "center",
  },
  confirmationBody: {
    color: semanticColors.text.secondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    maxWidth: 350,
    textAlign: "center",
  },
  routeCard: {
    backgroundColor: semanticColors.app.surface,
    borderColor: semanticColors.app.border,
    borderRadius: componentTokens.card.radius,
    borderWidth: componentTokens.card.borderWidth,
    flexDirection: "row",
    gap: spacing[4],
    overflow: "hidden",
    padding: componentTokens.card.padding,
    width: "100%",
  },
  routeMapStrip: {
    alignItems: "center",
    backgroundColor: colors.peachSoft,
    borderRadius: radii.md,
    justifyContent: "space-between",
    minHeight: 152,
    paddingVertical: spacing[4],
    width: 32,
  },
  routePin: {
    backgroundColor: semanticColors.action.accentBackground,
    borderColor: semanticColors.action.accentForeground,
    borderRadius: radii.pill,
    borderWidth: 3,
    height: 16,
    width: 16,
  },
  destinationPin: {
    backgroundColor: semanticColors.action.primaryBackground,
    borderColor: semanticColors.action.primaryForeground,
  },
  routeLine: {
    backgroundColor: semanticColors.action.focusRing,
    flex: 1,
    marginVertical: -1,
    width: 4,
  },
  routeText: {
    flex: 1,
    gap: spacing[1],
    justifyContent: "center",
  },
  routeLabel: {
    color: semanticColors.text.muted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  routeValue: {
    color: colors.ink,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 22,
  },
  routeStop: {
    color: semanticColors.text.muted,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  routeArrow: {
    color: semanticColors.text.muted,
    fontSize: typography.fontSize.lg,
    lineHeight: 22,
  },
  detailGrid: {
    backgroundColor: semanticColors.app.surface,
    borderColor: semanticColors.app.border,
    borderRadius: componentTokens.card.radius,
    borderWidth: componentTokens.card.borderWidth,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  detailCell: {
    borderBottomColor: semanticColors.app.border,
    borderBottomWidth: 1,
    gap: spacing[1],
    minHeight: 78,
    padding: spacing[4],
    width: "50%",
  },
  detailLabel: {
    color: semanticColors.text.muted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  detailValue: {
    color: colors.ink,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 21,
  },
  nextStepCard: {
    alignSelf: "stretch",
    backgroundColor: semanticColors.app.surfaceMuted,
    borderRadius: componentTokens.card.radius,
    gap: spacing[2],
    padding: componentTokens.card.padding,
  },
  nextStepTitle: {
    color: colors.ink,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  nextStepBody: {
    color: semanticColors.text.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
  },
});
