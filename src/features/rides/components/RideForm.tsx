import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { formatCents, estimateSuggestedContribution } from "../../../lib/pricing";
import { MapsService } from "../../../lib/maps";
import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { calPoly, sfo } from "../fixtures";
import { PlacePicker } from "./PlacePicker";
import {
  DEFAULT_DISPLAY_TIMEZONE,
  DriverSummary,
  Place,
  PriceSource,
  Ride,
  RideDraftErrors,
  RidesService,
  RouteSummary,
  VehicleSummary,
} from "../types";
import { validateRideDraft } from "../validation";

export type RideFormProps = {
  ridesService: RidesService;
  mapsService: MapsService;
  driver: DriverSummary;
  vehicle: VehicleSummary;
  now?: Date | string;
  onPublished: (ride: Ride) => void;
};

type FormValues = {
  origin: Place | null;
  destination: Place | null;
  stop: Place | null;
  departureDate: string;
  departureTime: string;
  capacity: string;
  priceDollars: string;
  notes: string;
};

type RouteState = "idle" | "loading" | "ready" | "error";
const PRICING_ASSUMPTIONS = {
  assumedMpg: 28,
  fuelPriceCentsPerGallon: 450,
  tollsCents: 0,
} as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_DISPLAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(lookup.year), month: Number(lookup.month), day: Number(lookup.day) };
}

function tomorrowInLosAngeles(now: Date | string | undefined) {
  const date = now ? (now instanceof Date ? now : new Date(now)) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const local = localDateParts(safeDate);
  const tomorrow = new Date(Date.UTC(local.year, local.month - 1, local.day + 1));
  return `${tomorrow.getUTCFullYear()}-${pad(tomorrow.getUTCMonth() + 1)}-${pad(tomorrow.getUTCDate())}`;
}

function initialValues(now: Date | string | undefined): FormValues {
  return {
    origin: { ...calPoly },
    destination: { ...sfo },
    stop: null,
    departureDate: tomorrowInLosAngeles(now),
    departureTime: "09:00",
    capacity: "3",
    priceDollars: "",
    notes: "",
  };
}

function centsFromDollars(value: string) {
  const normalized = value.trim().replace(/^\$/, "");
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) {
    return null;
  }
  const [whole, decimal = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

function dollarsFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

function displayCents(cents: number) {
  const formatted = formatCents(cents);
  return formatted.startsWith("$") ? formatted : `$${formatted}`;
}

function errorFor(errors: RideDraftErrors, ...fields: (keyof RideDraftErrors)[]) {
  return fields.map((field) => errors[field]).find(Boolean);
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <Text accessibilityRole="alert" style={styles.errorText}>
      {message}
    </Text>
  ) : null;
}

export function RideForm({ ridesService, mapsService, driver, vehicle, now, onPublished }: RideFormProps) {
  const defaults = useMemo(() => initialValues(now), [now]);
  const [values, setValues] = useState<FormValues>(defaults);
  const [showStop, setShowStop] = useState(false);
  const [errors, setErrors] = useState<RideDraftErrors>({});
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeState, setRouteState] = useState<RouteState>("idle");
  const [routeError, setRouteError] = useState("");
  const [suggestedCents, setSuggestedCents] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const enteredPriceCents = centsFromDollars(values.priceDollars);
  const priceSource: PriceSource = suggestedCents != null && enteredPriceCents === suggestedCents ? "suggested" : "driver_set";

  const routePlaces = useMemo(
    () => [values.origin, values.stop, values.destination].filter((place): place is Place => Boolean(place)),
    [values.destination, values.origin, values.stop],
  );

  useEffect(() => {
    let active = true;
    if (!values.origin || !values.destination) {
      const resetTimer = setTimeout(() => {
        if (!active) return;
        setRouteSummary(null);
        setSuggestedCents(null);
        setRouteState("idle");
        setRouteError("");
      }, 0);
      return () => {
        active = false;
        clearTimeout(resetTimer);
      };
    }

    const requestTimer = setTimeout(() => {
      if (!active) return;
      setRouteState("loading");
      setRouteError("");
      mapsService
        .getRoute(routePlaces)
        .then((route) => {
          if (!active) return;
          setRouteSummary(route);
          setRouteState("ready");
          try {
            const riderSeatCapacity = Math.max(1, Number(values.capacity) || 1);
            const result = estimateSuggestedContribution(route.distanceMeters, riderSeatCapacity, PRICING_ASSUMPTIONS);
            setSuggestedCents(result.perSeatContributionCents);
          } catch {
            setSuggestedCents(null);
          }
        })
        .catch((error: unknown) => {
          if (!active) return;
          setRouteSummary(null);
          setSuggestedCents(null);
          setRouteState("error");
          setRouteError(error instanceof Error ? error.message : "Route estimate is unavailable.");
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(requestTimer);
    };
  }, [mapsService, routePlaces, values.capacity, values.destination, values.origin]);

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  }

  function applySuggestion() {
    if (suggestedCents == null) return;
    update("priceDollars", dollarsFromCents(suggestedCents));
  }

  function removeStop() {
    update("stop", null);
    setShowStop(false);
  }

  async function submit() {
    if (submitting) return;
    const priceCents = centsFromDollars(values.priceDollars);
    const draft = {
      driver,
      vehicle,
      origin: values.origin as Place,
      destination: values.destination as Place,
      stops: values.stop ? [values.stop] : [],
      routeSummary,
      departureDate: values.departureDate,
      departureTime: values.departureTime,
      displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
      capacity: values.capacity,
      priceCents: priceCents ?? values.priceDollars,
      priceSource,
      notes: values.notes,
    };
    const validation = validateRideDraft(draft, { now: now ?? new Date() });
    const nextErrors = !values.priceDollars.trim()
      ? { ...(!validation.ok ? validation.errors : {}), priceCents: "Contribution is required." }
      : !validation.ok
        ? validation.errors
        : {};
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Review the highlighted fields before publishing.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const ride = await ridesService.create(draft);
      onPublished(ride);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "Couldn’t publish this ride. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const departureError = errorFor(errors, "departureDate", "departureTime");
  const priceError = errorFor(errors, "priceCents");
  const routeLabel = routeState === "loading" ? "Calculating route…" : routeSummary ? `${(routeSummary.distanceMeters / 1609.344).toFixed(0)} mi route` : "Route preview";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>POST A RIDE</Text>
          <Text style={styles.title}>Where are you headed?</Text>
          <Text style={styles.subtitle}>Share a seat with a fellow Cal Poly student.</Text>
        </View>

        <View style={styles.card}>
          <PlacePicker
            label="Origin"
            value={values.origin}
            onChange={(place) => update("origin", place)}
            service={mapsService}
            disabled={submitting}
            helperText="Choose where the ride starts."
            fallbackPlaces={[{ ...calPoly }]}
          />
          <FieldError message={errors.origin} />
          <PlacePicker
            label="Destination"
            value={values.destination}
            onChange={(place) => update("destination", place)}
            service={mapsService}
            disabled={submitting}
            helperText="Choose the final destination."
            fallbackPlaces={[{ ...sfo }]}
          />
          <FieldError message={errors.destination} />

          {showStop ? (
            <View style={styles.stopBlock}>
              <PlacePicker
                label="Optional stop 1"
                value={values.stop}
                onChange={(place) => update("stop", place)}
                service={mapsService}
                disabled={submitting}
                helperText="Stops are used in the order shown."
              />
              <Pressable accessibilityRole="button" accessibilityLabel="Remove optional stop" disabled={submitting} onPress={removeStop} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>Remove stop</Text>
              </Pressable>
              <FieldError message={errors.stops} />
            </View>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Add an optional pickup stop" disabled={submitting} onPress={() => setShowStop(true)} style={styles.addStopButton}>
              <Text style={styles.addStopLabel}>＋ Add an optional pickup stop</Text>
            </Pressable>
          )}
          <Text style={styles.routeStatus}>{routeLabel}</Text>
          {routeState === "error" ? <Text accessibilityRole="alert" style={styles.warningText}>Maps couldn’t calculate this route. You can still publish using the selected places.</Text> : null}
          {routeState === "loading" ? <ActivityIndicator accessibilityLabel="Calculating route" color={semanticColors.action.primaryBackground} /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>When are you leaving?</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Date</Text>
              <TextInput accessibilityLabel="Departure date, YYYY-MM-DD" editable={!submitting} value={values.departureDate} onChangeText={(value) => update("departureDate", value)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} autoCapitalize="none" />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Time</Text>
              <TextInput accessibilityLabel="Departure time, HH:MM" editable={!submitting} value={values.departureTime} onChangeText={(value) => update("departureTime", value)} placeholder="HH:MM" placeholderTextColor={colors.textMuted} style={styles.input} autoCapitalize="none" />
            </View>
          </View>
          <Text style={styles.helperText}>Displayed in Pacific time ({DEFAULT_DISPLAY_TIMEZONE}).</Text>
          <FieldError message={departureError} />

          <Text style={styles.label}>Open seats</Text>
          <TextInput accessibilityLabel="Open seat capacity" editable={!submitting} value={values.capacity} onChangeText={(value) => update("capacity", value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" style={styles.input} />
          <Text style={styles.helperText}>Your {vehicle.label} has {vehicle.seatCount} seats available for this ride.</Text>
          <FieldError message={errors.capacity} />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>Contribution per seat</Text>
              <Text style={styles.helperText}>Cost sharing only—no payments in Shotgun.</Text>
            </View>
            <Text style={styles.sourceBadge}>{priceSource === "suggested" ? "Suggested" : values.priceDollars.trim() ? "Driver set" : "Not set"}</Text>
          </View>
          <TextInput accessibilityLabel="Contribution per seat in dollars" editable={!submitting} value={values.priceDollars} onChangeText={(value) => update("priceDollars", value.replace(/[^0-9.]/g, ""))} placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.input} />
          <FieldError message={priceError} />
          {suggestedCents != null ? (
            <View style={styles.suggestionBox}>
              <View style={styles.flex}>
                <Text style={styles.suggestionTitle}>Suggested contribution: {displayCents(suggestedCents)}</Text>
                <Text style={styles.helperText}>Based on 28 MPG · $4.50/gal · $0 tolls</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Use suggested contribution ${displayCents(suggestedCents)}`} disabled={submitting} onPress={applySuggestion} style={styles.useButton}>
                <Text style={styles.useButtonLabel}>Use</Text>
              </Pressable>
            </View>
          ) : routeError ? <Text style={styles.helperText}>A contribution suggestion will appear when a route is available. You can enter a driver-set amount.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput accessibilityLabel="Ride notes" editable={!submitting} multiline maxLength={500} value={values.notes} onChangeText={(value) => update("notes", value)} placeholder="Pickup details, luggage, or timing…" placeholderTextColor={colors.textMuted} style={[styles.input, styles.notesInput]} textAlignVertical="top" />
          <Text style={styles.helperText}>{values.notes.length}/500</Text>
          <FieldError message={errors.notes} />
        </View>

        {submitError ? <Text accessibilityRole="alert" style={styles.submitError}>{submitError}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Publish ride" disabled={submitting} onPress={submit} style={({ pressed }) => [styles.publishButton, (pressed || submitting) && styles.buttonMuted]}>
          {submitting ? <ActivityIndicator color={semanticColors.action.primaryForeground} /> : <Text style={styles.publishLabel}>Publish ride</Text>}
        </Pressable>
        <Text style={styles.footerNote}>You can edit details later if your plans change.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { backgroundColor: semanticColors.app.background, gap: spacing[4], padding: spacing[4], paddingBottom: spacing[12] },
  header: { gap: spacing[2], paddingTop: spacing[4] },
  kicker: { color: semanticColors.text.link, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  title: { color: colors.ink, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.tight },
  subtitle: { color: colors.textMuted, fontSize: typography.fontSize.md, lineHeight: 24 },
  card: { backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing[3], padding: spacing[4] },
  sectionTitle: { color: colors.ink, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3] },
  label: { color: colors.ink, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label, textTransform: "uppercase" },
  input: { backgroundColor: semanticColors.app.surfaceMuted, borderColor: semanticColors.app.border, borderRadius: radii.md, borderWidth: 1, color: colors.ink, fontSize: typography.fontSize.md, minHeight: 52, paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  notesInput: { minHeight: 112, paddingTop: spacing[3] },
  row: { flexDirection: "row", gap: spacing[3] },
  halfField: { flex: 1, gap: spacing[2] },
  helperText: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 20 },
  errorText: { color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 20 },
  warningText: { backgroundColor: semanticColors.status.warningBackground, borderRadius: radii.sm, color: semanticColors.status.warningForeground, fontSize: typography.fontSize.sm, lineHeight: 20, padding: spacing[3] },
  routeStatus: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  stopBlock: { gap: spacing[2] },
  textButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[2] },
  textButtonLabel: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  addStopButton: { alignItems: "center", alignSelf: "flex-start", borderColor: semanticColors.app.borderStrong, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[4] },
  addStopLabel: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  sourceBadge: { backgroundColor: semanticColors.app.surfaceMuted, borderRadius: radii.pill, color: semanticColors.text.secondary, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, overflow: "hidden", paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  suggestionBox: { alignItems: "center", backgroundColor: semanticColors.status.successBackground, borderRadius: radii.md, flexDirection: "row", gap: spacing[3], padding: spacing[3] },
  suggestionTitle: { color: semanticColors.status.successForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  useButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: radii.pill, justifyContent: "center", minHeight: 44, minWidth: 64, paddingHorizontal: spacing[3] },
  useButtonLabel: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  submitError: { backgroundColor: semanticColors.status.dangerBackground, borderRadius: radii.sm, color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 20, padding: spacing[3] },
  publishButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: componentTokensButtonRadius(), justifyContent: "center", minHeight: 52, paddingHorizontal: spacing[5] },
  publishLabel: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  buttonMuted: { opacity: 0.55 },
  footerNote: { color: colors.textSubtle, fontSize: typography.fontSize.xs, lineHeight: 18, textAlign: "center" },
});

function componentTokensButtonRadius() {
  return radii.md;
}
