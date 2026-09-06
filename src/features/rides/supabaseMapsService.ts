import type { MapsService } from "../../lib/maps";
import type { Place, RouteSummary } from "./types";

type FunctionInvoker = (name: string, options: { body: Record<string, unknown> }) => Promise<{ data: unknown; error: unknown }>;
type SearchResponse = { places: Place[] };
type RouteResponse = { route: RouteSummary };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== "object") return false;
  const place = value as Partial<Place>;
  return typeof place.id === "string" && typeof place.label === "string" && isFiniteNumber(place.lat) && isFiniteNumber(place.lng);
}

function isRoutePoint(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== "object") return false;
  const point = value as { lat?: unknown; lng?: unknown };
  return isFiniteNumber(point.lat) && isFiniteNumber(point.lng);
}

function mapsError(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return new Error(error.message);
  return new Error("Live maps are temporarily unavailable.");
}

async function invokeSupabase(name: string, options: { body: Record<string, unknown> }) {
  const { supabase } = await import("../../lib/supabase");
  return supabase.functions.invoke(name, options);
}

export function createSupabaseMapsService(
  invoke: FunctionInvoker = invokeSupabase,
): MapsService {
  return {
    async searchPlaces(query) {
      const { data, error } = await invoke("geoapify-maps", { body: { operation: "search", query } });
      if (error) throw mapsError(error);
      const places = (data as Partial<SearchResponse> | null)?.places;
      if (!Array.isArray(places) || !places.every(isPlace)) throw mapsError(null);
      return places;
    },
    async getRoute(stops) {
      const { data, error } = await invoke("geoapify-maps", { body: { operation: "route", stops } });
      if (error) throw mapsError(error);
      const route = (data as Partial<RouteResponse> | null)?.route;
      if (!route || !isFiniteNumber(route.distanceMeters) || !isFiniteNumber(route.durationSeconds)) throw mapsError(null);
      if (
        route.legDurationsSeconds != null &&
        (!Array.isArray(route.legDurationsSeconds) ||
          route.legDurationsSeconds.length !== stops.length - 1 ||
          !route.legDurationsSeconds.every((duration) => isFiniteNumber(duration) && duration >= 0))
      ) throw mapsError(null);
      if (route.path != null && (!Array.isArray(route.path) || !route.path.every(isRoutePoint))) throw mapsError(null);
      return route;
    },
  };
}
