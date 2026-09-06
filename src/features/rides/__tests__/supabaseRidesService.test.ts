import { DEFAULT_DISPLAY_TIMEZONE } from "../types";
import { createSupabaseRidesService, type RideListingRow, type SupabaseRideQuerySource } from "../supabaseRidesService";

const nowIso = "2026-09-05T18:00:00.000Z";

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
  if (!value) fail(message ?? "Expected value to be truthy.");
}

async function assertRejects(fn: () => Promise<unknown>, message?: string) {
  let rejected = false;
  try {
    await fn();
  } catch (error) {
    rejected = true;
    if (message && !(error instanceof Error && error.message.includes(message))) {
      fail(`Expected rejection message to include ${JSON.stringify(message)}, received ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (!rejected) {
    fail(message ? `Expected rejection including ${message}` : "Expected promise to reject.");
  }
}

const rideRows: RideListingRow[] = [
  {
    id: "ride-second",
    driver_id: "driver-second",
    vehicle_id: "vehicle-second",
    origin_label: "Cal Poly San Luis Obispo",
    origin_lat: 35.305,
    origin_lng: -120.6625,
    destination_label: "Santa Barbara, State Street",
    destination_lat: 34.4208,
    destination_lng: -119.6982,
    departure_at: "2026-09-07T20:00:00.000Z",
    display_timezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 2,
    status: "scheduled",
    price_cents: 950,
    price_source: "suggested",
    notes: "Fast coffee stop if time allows.",
    distance_meters: null,
    duration_seconds: null,
    assumed_mpg: null,
    fuel_price_cents_per_gallon: null,
    tolls_cents: 0,
    created_at: nowIso,
    updated_at: nowIso,
    remaining_seats: 2,
  },
  {
    id: "ride-first",
    driver_id: "driver-first",
    vehicle_id: "vehicle-first",
    origin_label: "Cal Poly, San Luis Obispo",
    origin_lat: 35.305,
    origin_lng: -120.6625,
    destination_label: "San Francisco International Airport (SFO)",
    destination_lat: 37.6213,
    destination_lng: -122.379,
    departure_at: "2026-09-06T16:00:00.000Z",
    display_timezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 3,
    status: "scheduled",
    price_cents: 1250,
    price_source: "driver_set",
    notes: "One downtown pickup.",
    distance_meters: 370000,
    duration_seconds: 14400,
    assumed_mpg: 30,
    fuel_price_cents_per_gallon: 450,
    tolls_cents: 0,
    created_at: nowIso,
    updated_at: nowIso,
    remaining_seats: 1,
  },
];

const profiles = [
  {
    id: "driver-first",
    first_name: "Maya Chen",
    avatar_url: null,
    school: "Cal Poly SLO",
    graduation_year: 2027,
    verification_status: "school_email" as const,
    rating_average: 4.9,
    completed_ride_count: 28,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "driver-second",
    first_name: "Aria Thompson",
    avatar_url: null,
    school: "Cal Poly SLO",
    graduation_year: 2026,
    verification_status: "school_email" as const,
    rating_average: 4.7,
    completed_ride_count: 11,
    created_at: nowIso,
    updated_at: nowIso,
  },
];

const vehicles = [
  {
    id: "vehicle-first",
    owner_id: "driver-first",
    make: "Honda",
    model: "Civic",
    color: "Blue",
    seat_count: 4,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "vehicle-second",
    owner_id: "driver-second",
    make: "Toyota",
    model: "RAV4",
    color: "Green",
    seat_count: 2,
    created_at: nowIso,
    updated_at: nowIso,
  },
];

const stops = [
  {
    id: "stop-downtown",
    ride_id: "ride-first",
    sequence: 0,
    label: "Downtown San Luis Obispo",
    lat: 35.2828,
    lng: -120.6596,
    created_at: nowIso,
  },
];

function createFakeSource(overrides: Partial<SupabaseRideQuerySource> = {}) {
  const calls = {
    listRideListings: [] as Array<{ nowIso: string; filters: unknown }>,
    getRideListing: [] as string[],
    getProfiles: [] as string[][],
    getVehicles: [] as string[][],
    getStops: [] as string[][],
  };

  const source: SupabaseRideQuerySource = {
    async listRideListings(query) {
      calls.listRideListings.push(query);
      return rideRows;
    },
    async getRideListing(id) {
      calls.getRideListing.push(id);
      return rideRows.find((row) => row.id === id) ?? null;
    },
    async getProfiles(ids) {
      calls.getProfiles.push(ids);
      return profiles.filter((profile) => ids.includes(profile.id));
    },
    async getVehicles(ids) {
      calls.getVehicles.push(ids);
      return vehicles.filter((vehicle) => ids.includes(vehicle.id));
    },
    async getStops(rideIds) {
      calls.getStops.push(rideIds);
      return stops.filter((stop) => rideIds.includes(stop.ride_id));
    },
    ...overrides,
  };

  return { source, calls };
}

async function run() {
  const { source, calls } = createFakeSource();
  const service = createSupabaseRidesService({ source, now: () => nowIso });

  const rides = await service.list({
    destinationQuery: "sfo",
    departureAtGte: "2026-09-05T18:00:00.000Z",
    departureAtLte: "2026-09-07T00:00:00.000Z",
    maxPriceCents: 1400,
    minimumRemainingSeats: 1,
  });

  assertEqual(calls.listRideListings.length, 1);
  assertDeepEqual(calls.listRideListings[0], {
    nowIso,
    filters: {
      destinationQuery: "sfo",
      departureAtGte: "2026-09-05T18:00:00.000Z",
      departureAtLte: "2026-09-07T00:00:00.000Z",
      maxPriceCents: 1400,
      minimumRemainingSeats: 1,
    },
  });
  assertDeepEqual(calls.getProfiles[0], ["driver-second", "driver-first"]);
  assertDeepEqual(calls.getVehicles[0], ["vehicle-second", "vehicle-first"]);
  assertDeepEqual(calls.getStops[0], ["ride-second", "ride-first"]);
  assertDeepEqual(rides.map((ride) => ride.id), ["ride-first"]);

  const first = rides[0];
  assertOk(first);
  if (!first) fail("Expected first ride");
  assertEqual(first.driver.name, "Maya Chen");
  assertEqual(first.driver.initials, "MC");
  assertEqual(first.vehicle.label, "Honda · Civic · Blue");
  assertDeepEqual(first.routeSummary, { distanceMeters: 370000, durationSeconds: 14400 });
  assertEqual(first.displayTimezone, DEFAULT_DISPLAY_TIMEZONE);
  assertEqual(first.remainingSeats, 1);
  assertDeepEqual(first.stops, [
    {
      id: "stop-downtown",
      label: "Downtown San Luis Obispo",
      lat: 35.2828,
      lng: -120.6596,
    },
  ]);

  const stopMatches = await service.list({ destinationQuery: "downtown" });
  assertDeepEqual(stopMatches.map((ride) => ride.id), ["ride-first"]);

  const wrongPickup = await service.list({
    pickupPlace: { id: "place-sfo", label: "SFO", lat: 37.6213, lng: -122.379 },
  });
  assertDeepEqual(wrongPickup, []);

  const byId = await service.getById("ride-first");
  assertEqual(byId?.id, "ride-first");
  assertEqual(byId?.destination.label, "San Francisco International Airport (SFO)");

  const missing = await service.getById("ride-missing");
  assertEqual(missing, null);

  await assertRejects(() => service.create({
    driver: profiles[0] as never,
    vehicle: {
      id: "vehicle-first",
      label: "Honda · Civic · Blue",
      seatCount: 4,
    },
    origin: {
      id: "place-cal-poly",
      label: "Cal Poly, San Luis Obispo",
      lat: 35.305,
      lng: -120.6625,
    },
    destination: {
      id: "place-sfo",
      label: "San Francisco International Airport (SFO)",
      lat: 37.6213,
      lng: -122.379,
    },
    stops: [],
    routeSummary: null,
    departureDate: "2026-09-06",
    departureTime: "09:00",
    capacity: 3,
    priceCents: 1250,
    notes: null,
  } as unknown as never), 'atomic ride + ride_stops mutation RPC');

  await assertRejects(() => service.update("ride-first", "driver-first", {
    driver: profiles[0] as never,
    vehicle: {
      id: "vehicle-first",
      label: "Honda · Civic · Blue",
      seatCount: 4,
    },
    origin: {
      id: "place-cal-poly",
      label: "Cal Poly, San Luis Obispo",
      lat: 35.305,
      lng: -120.6625,
    },
    destination: {
      id: "place-sfo",
      label: "San Francisco International Airport (SFO)",
      lat: 37.6213,
      lng: -122.379,
    },
    stops: [],
    routeSummary: null,
    departureDate: "2026-09-06",
    departureTime: "09:00",
    capacity: 3,
    priceCents: 1250,
    notes: null,
  } as unknown as never), 'atomic ride + ride_stops mutation RPC');

  console.log("supabase rides service tests passed");
}

run().catch((error) => {
  console.error(error);
  throw error;
});
