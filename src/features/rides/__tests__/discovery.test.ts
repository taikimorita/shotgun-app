import { fixtureRidesService } from "../service";
import {
  emptyDiscoveryFilters,
  formatRideDeparture,
  formatRidePrice,
  isRideRequestable,
  validateAndBuildRideFilters,
} from "../discovery";
import { Ride } from "../types";

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

function assertOk<T extends { ok: boolean }>(result: T): asserts result is T & { ok: true } {
  if (!result.ok) {
    fail(`Expected success, received ${JSON.stringify(result)}`);
  }
}

function assertError(result: { ok: true } | { ok: false; errors: Record<string, unknown> }, field: string) {
  if (result.ok || !(field in result.errors)) {
    fail(`Expected an error for ${field}.`);
  }
}

async function run() {
  assertDeepEqual(emptyDiscoveryFilters, {
    destinationQuery: "",
    departureDate: "",
    maxPriceDollars: "",
    minimumRemainingSeats: "",
  });

  const blank = validateAndBuildRideFilters(emptyDiscoveryFilters);
  assertOk(blank);
  assertDeepEqual(blank.filters, {});

  const tomorrow = validateAndBuildRideFilters({
    destinationQuery: "  SFO  ",
    departureDate: "2026-09-06",
    maxPriceDollars: "12.50",
    minimumRemainingSeats: "2",
  });
  assertOk(tomorrow);
  assertDeepEqual(tomorrow.filters, {
    destinationQuery: "SFO",
    departureAtGte: "2026-09-06T07:00:00.000Z",
    departureAtLte: "2026-09-07T06:59:59.999Z",
    maxPriceCents: 1250,
    minimumRemainingSeats: 2,
  });

  const service = fixtureRidesService;
  const rides = await service.list(tomorrow.filters);
  assertDeepEqual(rides.map((ride) => ride.id), ["ride-maya-slo-sfo"]);

  const exactCents = validateAndBuildRideFilters({ ...emptyDiscoveryFilters, maxPriceDollars: "0.01" });
  assertOk(exactCents);
  assertEqual(exactCents.filters.maxPriceCents, 1);
  const largerExactCents = validateAndBuildRideFilters({ ...emptyDiscoveryFilters, maxPriceDollars: "1000000.99" });
  assertOk(largerExactCents);
  assertEqual(largerExactCents.filters.maxPriceCents, 100000099);

  assertError(validateAndBuildRideFilters({ ...emptyDiscoveryFilters, departureDate: "2026-02-29" }), "departureDate");
  assertError(validateAndBuildRideFilters({ ...emptyDiscoveryFilters, departureDate: "09/06/2026" }), "departureDate");
  assertError(validateAndBuildRideFilters({ ...emptyDiscoveryFilters, maxPriceDollars: "-1.00" }), "maxPriceDollars");
  assertError(validateAndBuildRideFilters({ ...emptyDiscoveryFilters, maxPriceDollars: "12.345" }), "maxPriceDollars");
  assertError(validateAndBuildRideFilters({ ...emptyDiscoveryFilters, minimumRemainingSeats: "0" }), "minimumRemainingSeats");
  assertError(validateAndBuildRideFilters({ ...emptyDiscoveryFilters, minimumRemainingSeats: "1.5" }), "minimumRemainingSeats");

  const maya = rides[0];
  if (!maya) {
    fail("Expected Maya's fixture ride.");
  }
  assertEqual(formatRideDeparture(maya), "Sun, Sep 6, 9:00 AM PDT");
  assertEqual(formatRidePrice(maya), "$12.50 / seat · Suggested");

  const requestableNow = "2026-09-06T15:59:59.999Z";
  assertEqual(isRideRequestable(maya, requestableNow), true);
  assertEqual(isRideRequestable(maya, maya.departureAt), false);
  assertEqual(isRideRequestable({ ...maya, remainingSeats: 0 }, requestableNow), false);
  assertEqual(isRideRequestable({ ...maya, status: "cancelled" }, requestableNow), false);
  assertEqual(isRideRequestable({ ...maya, departureAt: "2026-09-06T15:59:59.000Z" }, requestableNow), false);

  const winter = { ...maya, departureAt: "2026-12-06T17:00:00.000Z" };
  assertEqual(formatRideDeparture(winter), "Sun, Dec 6, 9:00 AM PST");

  const cancelledFixture: Ride = {
    ...maya,
    status: "cancelled",
  };
  assertEqual(isRideRequestable(cancelledFixture, "2026-09-05T18:00:00.000Z"), false);

  console.log("ride discovery tests passed");
}

run().catch((error) => {
  console.error(error);
  throw error;
});
