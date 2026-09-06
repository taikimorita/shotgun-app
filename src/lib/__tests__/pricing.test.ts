import {
  calculateSuggestedContributionCents,
  estimateSuggestedContribution,
  formatCents,
  formatPricingAssumptions,
  resolvePricingAssumptions,
} from "../pricing";

function fail(message: string): never {
  throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    fail(message ?? `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => unknown, message?: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    fail(message ?? "Expected function to throw.");
  }
}

function run(): void {
  assertEqual(calculateSuggestedContributionCents(0, 3), 0, "A zero-distance trip costs zero by default.");
  assertEqual(calculateSuggestedContributionCents(370000, 3), 1232);

  const custom = estimateSuggestedContribution(1609.344, 2, {
    assumedMpg: 20,
    fuelPriceCentsPerGallon: 500,
    tollsCents: 101,
  });
  assertEqual(custom.fuelCostCents, 25);
  assertEqual(custom.totalTripCostCents, 126);
  assertEqual(custom.perSeatContributionCents, 63);
  assertEqual(custom.assumptions.tollsCents, 101);

  assertEqual(resolvePricingAssumptions({ mpg: 30 }).assumedMpg, 30);
  assertEqual(formatCents(0), "$0.00");
  assertEqual(formatCents(5), "$0.05");
  assertEqual(formatCents(1232), "$12.32");
  assertEqual(formatPricingAssumptions(), "28 MPG · $4.50/gal · $0.00 tolls");

  assertThrows(() => calculateSuggestedContributionCents(1000, 0));
  assertThrows(() => calculateSuggestedContributionCents(-1, 2));
  assertThrows(() => calculateSuggestedContributionCents(Number.NaN, 2));
  assertThrows(() => calculateSuggestedContributionCents(1000, 2, { assumedMpg: 0 }));
  assertThrows(() => calculateSuggestedContributionCents(1000, 2, { tollsCents: -1 }));
  assertThrows(() => formatCents(1.5));

  console.log("pricing tests passed");
}

run();
