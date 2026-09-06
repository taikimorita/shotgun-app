import { createMockMapsService } from "../mockMapsService";
import { createSupabaseMapsService } from "../supabaseMapsService";
import { calPoly, downtownSlo, sfo } from "../fixtures";
import { withMapsFallback, withRouteFallback } from "../../../lib/maps";
import { regionForPlaces, ridesNearDestination, uniqueRideDestinations } from "../mapPresentation";
import type { Ride } from "../types";

function fail(message: string): never {
  throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    fail(message ?? `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    fail(message ?? `Expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertOk(value: unknown, message?: string) {
  if (!value) {
    fail(message ?? "Expected value to be truthy.");
  }
}

async function assertRejects(fn: () => Promise<unknown>, message?: string) {
  let rejected = false;
  try {
    await fn();
  } catch {
    rejected = true;
  }
  if (!rejected) {
    fail(message ?? "Expected promise to reject.");
  }
}

async function run() {
  const service = createMockMapsService({ delayMs: 0 });

  const sloPlaces = await service.searchPlaces("slo");
  assertDeepEqual(
    sloPlaces.map((place) => place.id),
    ["place-cal-poly", "place-downtown-slo"],
    "Search should return the Cal Poly and downtown SLO demo locations in a stable order.",
  );
  assertEqual(sloPlaces[0].label, "Cal Poly, San Luis Obispo");
  assertEqual(sloPlaces[1].lat, downtownSlo.lat);

  const sfoPlaces = await service.searchPlaces("sfo");
  assertDeepEqual(sfoPlaces.map((place) => place.id), ["place-sfo"]);
  assertEqual(sfoPlaces[0].lng, sfo.lng);

  const noResults = await service.searchPlaces("needle in a haystack");
  assertDeepEqual(noResults, []);

  const route = await service.getRoute([calPoly, downtownSlo, sfo]);
  assertEqual(route.distanceMeters, 370000);
  assertEqual(route.durationSeconds, 14400);

  const fallbackRoute = await service.getRoute([calPoly, sfo]);
  assertOk(fallbackRoute.distanceMeters > 0);
  assertOk(fallbackRoute.durationSeconds > 0);
  assertDeepEqual(fallbackRoute.path, [{ lat: calPoly.lat, lng: calPoly.lng }, { lat: sfo.lat, lng: sfo.lng }]);

  const searchFailure = createMockMapsService({ delayMs: 0, failureMode: "search" });
  await assertRejects(() => searchFailure.searchPlaces("cal poly"));

  const routeFailure = createMockMapsService({ delayMs: 0, failureMode: "route" });
  await assertRejects(() => routeFailure.getRoute([calPoly, sfo]));

  const allFailure = createMockMapsService({ delayMs: 0, failureMode: "all" });
  await assertRejects(() => allFailure.searchPlaces("sfo"));
  await assertRejects(() => allFailure.getRoute([calPoly, sfo]));

  const resilient = withMapsFallback(allFailure, service);
  assertDeepEqual((await resilient.searchPlaces("sfo")).map((place) => place.id), ["place-sfo"]);
  assertEqual((await resilient.getRoute([calPoly, sfo])).distanceMeters, 368000);

  const routeResilient = withRouteFallback(allFailure, service);
  await assertRejects(() => routeResilient.searchPlaces("sfo"));
  assertEqual((await routeResilient.getRoute([calPoly, sfo])).distanceMeters, 368000);

  const calls: unknown[] = [];
  const live = createSupabaseMapsService(async (name, options) => {
    calls.push({ name, ...options });
    return options.body.operation === "search"
      ? { data: { places: [sfo] }, error: null }
      : { data: { route: { distanceMeters: 368123, durationSeconds: 13845, path: [{ lat: calPoly.lat, lng: calPoly.lng }, { lat: sfo.lat, lng: sfo.lng }] } }, error: null };
  });
  assertDeepEqual(await live.searchPlaces("SFO"), [sfo]);
  assertEqual((await live.getRoute([calPoly, sfo])).distanceMeters, 368123);
  assertDeepEqual(calls[0], { name: "geoapify-maps", body: { operation: "search", query: "SFO" } });

  const malformed = createSupabaseMapsService(async () => ({ data: { places: [{ id: "bad" }] }, error: null }));
  await assertRejects(() => malformed.searchPlaces("bad response"));

  const mapRides = [
    { id: "one", destination: sfo, remainingSeats: 2, status: "scheduled" },
    { id: "duplicate", destination: { ...sfo, id: "same-coordinates" }, remainingSeats: 1, status: "scheduled" },
    { id: "two", destination: downtownSlo, remainingSeats: 3, status: "scheduled" },
    { id: "full", destination: calPoly, remainingSeats: 0, status: "scheduled" },
    { id: "cancelled", destination: calPoly, remainingSeats: 2, status: "cancelled" },
  ] as Ride[];
  assertDeepEqual(uniqueRideDestinations(mapRides).map((place) => place.id), [sfo.id, downtownSlo.id]);
  const geoapifySfo = { ...sfo, id: "geoapify-sfo-terminal", label: "San Francisco International Airport, CA, United States of America" };
  const proximityRides = [
    { id: "ride-sfo", destination: sfo, stops: [downtownSlo], departureAt: "2026-09-06T16:00:00.000Z" },
    { id: "ride-slo", destination: downtownSlo, stops: [], departureAt: "2026-09-06T17:00:00.000Z" },
    { id: "ride-sb", destination: { id: "sb", label: "Santa Barbara", lat: 34.4208, lng: -119.6982 }, stops: [], departureAt: "2026-09-07T20:00:00.000Z" },
  ] as Ride[];
  assertDeepEqual(ridesNearDestination(proximityRides, geoapifySfo).map((ride) => ride.id), ["ride-sfo"]);
  assertDeepEqual(ridesNearDestination(proximityRides, downtownSlo).map((ride) => ride.id), ["ride-sfo", "ride-slo"]);
  const mapRegion = regionForPlaces([calPoly, sfo]);
  assertOk(mapRegion.latitudeDelta > Math.abs(sfo.lat - calPoly.lat));
  assertOk(mapRegion.longitudeDelta > Math.abs(sfo.lng - calPoly.lng));

  console.log("maps service tests passed");
}

run().catch((error) => {
  console.error(error);
  throw error;
});
