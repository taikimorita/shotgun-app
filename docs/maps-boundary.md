# Maps boundary: Owner C

`src/lib/maps.ts` is the only maps contract screens and ride UI may import. It exposes `Place`, `RouteSummary`, and `MapsService`; distance is always meters and duration is always seconds.

`src/features/rides/mockMapsService.ts` is deterministic fixture data for Cal Poly, Downtown San Luis Obispo, SFO, and the Cal Poly-to-SFO demo route. It deliberately accepts no vendor key, provider name, or environment value.

`PlacePicker` owns all search UI states: idle, searching, no-results, error, selected, clear, disabled, and fallback. Its request sequence guard prevents older searches from replacing current results. To exercise the mock error state, search for `error`; use any unmatched text to see the fallback action.
