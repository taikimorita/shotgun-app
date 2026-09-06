import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MapsService, Place } from '@/src/lib/maps';
import { semanticColors, spacing, radii, typography } from '@/src/theme/tokens';

export type PlacePickerState = 'idle' | 'searching' | 'no-results' | 'error' | 'selected' | 'disabled' | 'fallback';

type PlacePickerProps = Readonly<{
  label: string;
  service: MapsService;
  value: Place | null;
  onChange: (place: Place | null) => void;
  placeholder?: string;
  disabled?: boolean;
  fallbackPlace?: Place;
}>;

const SEARCH_DELAY_MS = 250;

/**
 * Accessible, provider-neutral place search control. Search sequence IDs ensure
 * a slower, stale request can never overwrite results from newer input.
 */
export function PlacePicker({
  label,
  service,
  value,
  onChange,
  placeholder = 'Search a place',
  disabled = false,
  fallbackPlace,
}: PlacePickerProps) {
  const [query, setQuery] = useState(value?.label ?? '');
  const [results, setResults] = useState<readonly Place[]>([]);
  const [state, setState] = useState<PlacePickerState>(disabled ? 'disabled' : value ? 'selected' : 'idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestSearchId = useRef(0);

  useEffect(() => {
    if (disabled) {
      setState('disabled');
      return;
    }
    if (value && query === value.label) setState('selected');
  }, [disabled, query, value]);

  useEffect(() => {
    if (disabled || value || query.trim().length === 0) return;

    const searchId = ++latestSearchId.current;
    const timer = setTimeout(async () => {
      setState('searching');
      setErrorMessage(null);
      try {
        const nextResults = await service.searchPlaces(query);
        if (searchId !== latestSearchId.current) return;
        setResults(nextResults);
        setState(nextResults.length > 0 ? 'idle' : fallbackPlace ? 'fallback' : 'no-results');
      } catch (error) {
        if (searchId !== latestSearchId.current) return;
        setResults([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to search places.');
        setState('error');
      }
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [disabled, fallbackPlace, query, service, value]);

  function search(valueToSearch: string) {
    latestSearchId.current += 1;
    setQuery(valueToSearch);
    setResults([]);
    setErrorMessage(null);
    if (value) onChange(null);
    if (valueToSearch.trim().length === 0) setState('idle');
  }

  function select(place: Place, nextState: PlacePickerState = 'selected') {
    latestSearchId.current += 1;
    setQuery(place.label);
    setResults([]);
    setState(nextState);
    onChange(place);
  }

  function clear() {
    latestSearchId.current += 1;
    setQuery('');
    setResults([]);
    setErrorMessage(null);
    setState('idle');
    onChange(null);
  }

  const statusText = disabled
    ? 'Place selection is unavailable.'
    : state === 'searching'
      ? 'Searching places.'
      : state === 'no-results'
        ? 'No matching places found.'
        : state === 'error'
          ? errorMessage ?? 'Unable to search places.'
          : state === 'fallback'
            ? 'No exact match found. You can use the suggested place.'
            : value
              ? `${value.label} selected.`
              : '';

  return (
    <View style={styles.container}>
      <Text nativeID={`${label}-label`} style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, disabled && styles.inputDisabled]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityLabelledBy={`${label}-label`}
          editable={!disabled}
          onChangeText={search}
          placeholder={placeholder}
          placeholderTextColor={semanticColors.text.muted}
          style={styles.input}
          value={query}
        />
        {state === 'searching' ? <ActivityIndicator accessibilityLabel="Searching places" color={semanticColors.action.primaryBackground} /> : null}
        {!disabled && (query.length > 0 || value) ? (
          <Pressable accessibilityLabel={`Clear ${label}`} accessibilityRole="button" hitSlop={8} onPress={clear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <View accessibilityLiveRegion="polite" accessibilityRole="text">
        {statusText ? <Text style={[styles.status, state === 'error' && styles.error]}>{statusText}</Text> : null}
      </View>

      {results.length > 0 ? (
        <View accessibilityLabel={`${label} suggestions`} style={styles.results}>
          {results.map((place) => (
            <Pressable
              accessibilityLabel={`Select ${place.label}`}
              accessibilityRole="button"
              key={place.id}
              onPress={() => select(place)}
              style={({ pressed }) => [styles.result, pressed && styles.resultPressed]}
            >
              <Text style={styles.resultText}>{place.label}</Text>
              <Text style={styles.coordinates}>{place.coordinates.latitude.toFixed(4)}, {place.coordinates.longitude.toFixed(4)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {(state === 'fallback' || state === 'error') && fallbackPlace ? (
        <Pressable accessibilityRole="button" onPress={() => select(fallbackPlace, 'fallback')} style={styles.fallbackButton}>
          <Text style={styles.fallbackText}>Use {fallbackPlace.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[2] },
  label: { color: semanticColors.text.primary, ...typography.textStyle.bodySmall, fontWeight: typography.fontWeight.bold },
  inputRow: { alignItems: 'center', backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.borderStrong, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', minHeight: 48, paddingHorizontal: spacing[3] },
  inputDisabled: { backgroundColor: semanticColors.app.surfaceMuted, opacity: 0.7 },
  input: { color: semanticColors.text.primary, flex: 1, fontSize: typography.fontSize.md, minHeight: 46, paddingVertical: 0 },
  clearButton: { marginLeft: spacing[2], paddingVertical: spacing[1] },
  clearText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  status: { color: semanticColors.text.muted, fontSize: typography.fontSize.sm, lineHeight: 20 },
  error: { color: semanticColors.status.dangerForeground },
  results: { borderColor: semanticColors.app.border, borderRadius: radii.md, borderWidth: 1, overflow: 'hidden' },
  result: { backgroundColor: semanticColors.app.surface, gap: spacing[1], padding: spacing[3] },
  resultPressed: { backgroundColor: semanticColors.app.surfaceMuted },
  resultText: { color: semanticColors.text.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.medium },
  coordinates: { color: semanticColors.text.muted, fontSize: typography.fontSize.xs },
  fallbackButton: { alignSelf: 'flex-start', backgroundColor: semanticColors.action.secondaryBackground, borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.sm, borderWidth: 1, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  fallbackText: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
});
