import { Place, RouteSummary } from "../features/rides/types";

export interface MapsService {
  searchPlaces(query: string): Promise<Place[]>;
  getRoute(stops: Place[]): Promise<RouteSummary>;
}

export function withMapsFallback(primary: MapsService, fallback: MapsService): MapsService {
  return {
    async searchPlaces(query) {
      try {
        return await primary.searchPlaces(query);
      } catch {
        return fallback.searchPlaces(query);
      }
    },
    async getRoute(stops) {
      try {
        return await primary.getRoute(stops);
      } catch {
        return fallback.getRoute(stops);
      }
    },
  };
}

export type MockMapsFailureMode = "search" | "route" | "all";

export interface MockMapsServiceOptions {
  delayMs?: number;
  failureMode?: MockMapsFailureMode;
}

export function normalizeMapsQuery(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function createRouteKey(stops: readonly Place[]) {
  return stops
    .map((stop) => `${normalizeMapsQuery(stop.label)}:${stop.lat.toFixed(4)}:${stop.lng.toFixed(4)}`)
    .join(" > ");
}

export function clonePlace(place: Place): Place {
  return { ...place };
}

export function cloneRouteSummary(routeSummary: RouteSummary): RouteSummary {
  return { ...routeSummary };
}
