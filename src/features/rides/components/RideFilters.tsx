import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import type { DiscoveryFilterValues } from "../discovery";

export type RideFiltersProps = {
  value: DiscoveryFilterValues;
  errors?: Partial<Record<keyof DiscoveryFilterValues, string>>;
  disabled?: boolean;
  applied: boolean;
  onChange: (next: DiscoveryFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
};

function FieldError({ message }: { message?: string }) {
  return message ? (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  ) : null;
}

export function RideFilters({ value, errors, disabled = false, applied, onChange, onApply, onClear }: RideFiltersProps) {
  function update(field: keyof DiscoveryFilterValues, nextValue: string) {
    onChange({ ...value, [field]: nextValue });
  }

  return (
    <View accessibilityLabel="Ride filters" style={[styles.card, disabled && styles.cardDisabled]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>FIND A RIDE</Text>
          <Text style={styles.title}>Where are you headed?</Text>
          <Text style={styles.subtitle}>Filter by destination, timing, and what fits your budget.</Text>
        </View>
        {applied ? <Text style={styles.appliedBadge}>Applied</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          accessibilityLabel="Destination search"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
          onChangeText={(nextValue) => update("destinationQuery", nextValue)}
          placeholder="SFO, downtown SLO, or another place"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value.destinationQuery}
        />
        <FieldError message={errors?.destinationQuery} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Departure date</Text>
        <TextInput
          accessibilityLabel="Departure date, YYYY-MM-DD"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          onChangeText={(nextValue) => update("departureDate", nextValue.replace(/[^0-9-]/g, ""))}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value.departureDate}
        />
        <Text style={styles.helper}>Pacific time (America/Los_Angeles)</Text>
        <FieldError message={errors?.departureDate} />
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Max per-seat price</Text>
          <View style={styles.prefixInput}>
            <Text style={styles.prefix}>$</Text>
            <TextInput
              accessibilityLabel="Maximum per-seat price in dollars"
              autoCapitalize="none"
              editable={!disabled}
              keyboardType="decimal-pad"
              onChangeText={(nextValue) => update("maxPriceDollars", nextValue.replace(/[^0-9.]/g, ""))}
              placeholder="Any"
              placeholderTextColor={colors.textMuted}
              style={[styles.prefixTextInput, disabled && styles.inputDisabled]}
              value={value.maxPriceDollars}
            />
          </View>
          <FieldError message={errors?.maxPriceDollars} />
        </View>

        <View style={styles.halfField}>
          <Text style={styles.label}>Minimum seats</Text>
          <TextInput
            accessibilityLabel="Minimum available seats needed"
            autoCapitalize="none"
            editable={!disabled}
            keyboardType="number-pad"
            onChangeText={(nextValue) => update("minimumRemainingSeats", nextValue.replace(/[^0-9]/g, ""))}
            placeholder="Any"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value.minimumRemainingSeats}
          />
          <FieldError message={errors?.minimumRemainingSeats} />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Apply ride filters"
          accessibilityRole="button"
          accessibilityState={{ disabled, busy: disabled }}
          disabled={disabled}
          onPress={onApply}
          style={({ pressed }) => [styles.applyButton, (pressed || disabled) && styles.buttonMuted]}
        >
          <Text style={styles.applyLabel}>{disabled ? "Applying…" : "Apply filters"}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Clear ride filters"
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onClear}
          style={({ pressed }) => [styles.clearButton, (pressed || disabled) && styles.buttonMuted]}
        >
          <Text style={styles.clearLabel}>Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semanticColors.app.surface,
    borderColor: semanticColors.app.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing[4],
    padding: spacing[4],
  },
  cardDisabled: { opacity: 0.72 },
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3] },
  headerCopy: { flex: 1, gap: spacing[1] },
  kicker: { color: semanticColors.text.link, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  title: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.tight },
  subtitle: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 20 },
  appliedBadge: { backgroundColor: semanticColors.status.successBackground, borderRadius: radii.pill, color: semanticColors.status.successForeground, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, overflow: "hidden", paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  field: { gap: spacing[2] },
  label: { color: colors.ink, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label, textTransform: "uppercase" },
  input: { backgroundColor: semanticColors.app.surfaceMuted, borderColor: semanticColors.app.border, borderRadius: radii.md, borderWidth: 1, color: colors.ink, fontSize: typography.fontSize.md, minHeight: 48, paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  inputDisabled: { color: colors.textMuted },
  helper: { color: colors.textMuted, fontSize: typography.fontSize.xs, lineHeight: 18 },
  error: { color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 20 },
  row: { flexDirection: "row", gap: spacing[3] },
  halfField: { flex: 1, gap: spacing[2], minWidth: 0 },
  prefixInput: { alignItems: "center", backgroundColor: semanticColors.app.surfaceMuted, borderColor: semanticColors.app.border, borderRadius: radii.md, borderWidth: 1, flexDirection: "row", minHeight: 48, paddingLeft: spacing[3] },
  prefix: { color: colors.textMuted, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  prefixTextInput: { color: colors.ink, flex: 1, fontSize: typography.fontSize.md, minHeight: 46, paddingHorizontal: spacing[2], paddingVertical: spacing[3] },
  actions: { flexDirection: "row", gap: spacing[3], marginTop: spacing[1] },
  applyButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: componentTokensButtonRadius(), flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[4] },
  applyLabel: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  clearButton: { alignItems: "center", backgroundColor: semanticColors.action.secondaryBackground, borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.md, borderWidth: 1, justifyContent: "center", minHeight: 48, minWidth: 82, paddingHorizontal: spacing[4] },
  clearLabel: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  buttonMuted: { opacity: 0.55 },
});

function componentTokensButtonRadius() {
  return radii.md;
}
