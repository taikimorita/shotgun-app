import { createMockMapsService } from "../mockMapsService";
import { calPoly, downtownSlo, sfo } from "../fixtures";

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

  const searchFailure = createMockMapsService({ delayMs: 0, failureMode: "search" });
  await assertRejects(() => searchFailure.searchPlaces("cal poly"));

  const routeFailure = createMockMapsService({ delayMs: 0, failureMode: "route" });
  await assertRejects(() => routeFailure.getRoute([calPoly, sfo]));

  const allFailure = createMockMapsService({ delayMs: 0, failureMode: "all" });
  await assertRejects(() => allFailure.searchPlaces("sfo"));
  await assertRejects(() => allFailure.getRoute([calPoly, sfo]));

  console.log("maps service tests passed");
}

run().catch((error) => {
  console.error(error);
  throw error;
});
