import { estimateWaypointArrivalTimes } from "../arrivalTimes";
import { calPoly, losAngeles, morroBay, santaBarbaraAirport } from "../fixtures";

function fail(message: string): never {
  throw new Error(message);
}

function assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) fail(message ?? `Expected ${expectedJson}, received ${actualJson}`);
}

function run() {
  const places = [calPoly, morroBay, santaBarbaraAirport, losAngeles];
  assertDeepEqual(
    estimateWaypointArrivalTimes("2026-09-06T18:30:00.000Z", places, {
      distanceMeters: 365826,
      durationSeconds: 13216,
      legDurationsSeconds: [780, 6300, 6136],
    }),
    [
      "2026-09-06T18:30:00.000Z",
      "2026-09-06T18:43:00.000Z",
      "2026-09-06T20:28:00.000Z",
      "2026-09-06T22:10:16.000Z",
    ],
  );

  const fallback = estimateWaypointArrivalTimes("2026-09-06T18:30:00.000Z", places, {
    distanceMeters: 365826,
    durationSeconds: 13216,
  });
  assertDeepEqual(fallback[0], "2026-09-06T18:30:00.000Z");
  assertDeepEqual(fallback.at(-1), "2026-09-06T22:10:16.000Z");
  assertDeepEqual(estimateWaypointArrivalTimes("invalid", places, null), []);

  console.log("arrival time tests passed");
}

run();
