import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { defaultDemoPlaces } from "../mockMapsService";
import { Place } from "../types";
import { MapsService, normalizeMapsQuery } from "../../../lib/maps";
import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";

type PlacePickerProps = {
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  service: MapsService;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
  fallbackPlaces?: Place[];
};

type SearchState = "idle" | "searching" | "results" | "no-results" | "error";

type SearchResult = {
  query: string;
  state: Exclude<SearchState, "idle">;
  results: Place[];
  error: string;
};

function coords(place: Place) {
  return `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`;
}

export function PlacePicker({
  label,
  value,
  onChange,
  service,
  disabled = false,
  helperText,
  placeholder = "Search Cal Poly, SFO, or downtown SLO",
  fallbackPlaces = defaultDemoPlaces,
}: PlacePickerProps) {
  const valueId = value?.id ?? null;
  const [draftQuery, setDraftQuery] = useState<{ valueId: string | null; text: string } | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [retry, setRetry] = useState(0);
  const requestId = useRef(0);
  const query = draftQuery?.valueId === valueId ? draftQuery.text : value?.label ?? "";
  const selectedLabel = normalizeMapsQuery(value?.label ?? "");
  const normalizedQuery = normalizeMapsQuery(query);
  const shouldSearch = Boolean(normalizedQuery && (!value || normalizedQuery !== selectedLabel));
  const currentResult = shouldSearch && searchResult?.query === normalizedQuery ? searchResult : null;
  const state: SearchState = shouldSearch ? currentResult?.state ?? "searching" : "idle";
  const results = currentResult?.results ?? [];
  const error = currentResult?.error ?? "";

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (!shouldSearch) {
      return;
    }

    const ticket = ++requestId.current;
    const timer = setTimeout(() => {
      service
        .searchPlaces(normalizedQuery)
        .then((next) => {
          if (ticket !== requestId.current) {
            return;
          }
          setSearchResult({
            query: normalizedQuery,
            state: next.length ? "results" : "no-results",
            results: next,
            error: "",
          });
        })
        .catch((caught) => {
          if (ticket !== requestId.current) {
            return;
          }
          setSearchResult({
            query: normalizedQuery,
            state: "error",
            results: fallbackPlaces,
            error: caught instanceof Error ? caught.message : "Couldn’t search places.",
          });
        });
    }, 140);

    return () => {
      requestId.current += 1;
      clearTimeout(timer);
    };
  }, [disabled, fallbackPlaces, normalizedQuery, retry, service, shouldSearch]);

  function clear() {
    requestId.current += 1;
    setDraftQuery({ valueId, text: "" });
    setSearchResult(null);
    onChange(null);
  }

  function choose(place: Place) {
    Keyboard.dismiss();
    requestId.current += 1;
    setDraftQuery(null);
    setSearchResult(null);
    onChange(place);
  }

  function retrySearch() {
    if (!disabled) {
      setRetry((value) => value + 1);
    }
  }

  const statusMessage =
    state === "searching"
      ? "Searching places..."
      : state === "no-results"
        ? "No matching places found."
        : state === "error"
          ? `${error} Demo locations are still available below.`
          : value
            ? `Selected ${value.label}.`
            : helperText ?? "Search for a place to continue.";
  const visibleResults = state === "error" || state === "no-results" ? fallbackPlaces : results;
  const resultHeader =
    state === "error" ? "Demo locations" : state === "results" ? "Matches" : state === "no-results" ? "Try a demo location" : "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, value && styles.inputShellSelected]}>
        <TextInput
          accessibilityLabel={`${label} search`}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={[styles.input, disabled && styles.inputDisabled]}
          value={query}
          onChangeText={(text) => setDraftQuery({ valueId, text })}
        />
        {query ? (
          <Pressable
            accessibilityLabel={`Clear ${label.toLowerCase()} search`}
            accessibilityRole="button"
            disabled={disabled}
            onPress={clear}
            style={({ pressed }) => [styles.clearButton, (disabled || pressed) && styles.muted]}
          >
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        accessibilityLiveRegion="polite"
        accessibilityRole={state === "error" ? "alert" : "text"}
        style={[styles.status, state === "error" && styles.statusError]}
      >
        {statusMessage}
      </Text>

      {visibleResults.length > 0 ? <Text style={styles.resultsLabel}>{resultHeader}</Text> : null}
      {visibleResults.length > 0 ? (
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.resultsScroll} contentContainerStyle={styles.resultsList}>
          {visibleResults.map((place) => {
            const selected = value?.id === place.id;

            return (
              <Pressable
                key={place.id}
                accessibilityLabel={`${place.label}, ${coords(place)}`}
                accessibilityRole="button"
                disabled={disabled || selected}
                onPress={() => choose(place)}
                style={({ pressed }) => [styles.resultRow, selected && styles.resultRowSelected, (disabled || pressed) && styles.resultRowPressed]}
              >
                <View style={styles.resultCopy}>
                  <Text style={styles.resultTitle}>{place.label}</Text>
                  <Text style={styles.resultMeta}>{coords(place)}</Text>
                </View>
                <Text style={styles.resultAction}>{selected ? "Selected" : "Use"}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {state === "error" ? (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={retrySearch}
          style={({ pressed }) => [styles.retryButton, (disabled || pressed) && styles.muted]}
        >
          <Text style={styles.retryText}>Retry search</Text>
        </Pressable>
      ) : null}

      {state === "error" && fallbackPlaces.length > 0 ? (
        <Text style={styles.fallbackNote}>You can still pick a demo place while maps are unavailable.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  label: {
    color: colors.ink,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: semanticColors.app.surface,
    borderColor: semanticColors.app.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[2],
    minHeight: 52,
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
  },
  inputShellSelected: {
    backgroundColor: semanticColors.status.successBackground,
    borderColor: semanticColors.status.successForeground,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontSize: typography.fontSize.md,
    minHeight: 52,
  },
  inputDisabled: {
    color: colors.textMuted,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: semanticColors.app.surfaceMuted,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  clearText: {
    color: semanticColors.text.link,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  status: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  statusError: {
    color: semanticColors.status.dangerForeground,
  },
  resultsLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  resultsScroll: {
    maxHeight: 240,
  },
  resultsList: {
    gap: spacing[2],
  },
  resultRow: {
    alignItems: "center",
    backgroundColor: semanticColors.app.surface,
    borderColor: semanticColors.app.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[3],
    padding: spacing[3],
  },
  resultRowSelected: {
    backgroundColor: semanticColors.app.surfaceMuted,
    borderColor: semanticColors.action.focusRing,
  },
  resultRowPressed: {
    opacity: 0.75,
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    color: colors.ink,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  resultMeta: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
    marginTop: 2,
  },
  resultAction: {
    color: semanticColors.text.link,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  retryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: semanticColors.action.secondaryBackground,
    borderColor: semanticColors.app.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  retryText: {
    color: semanticColors.text.link,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  fallbackNote: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  muted: {
    opacity: 0.5,
  },
});
