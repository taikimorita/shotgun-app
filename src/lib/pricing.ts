/**
 * Deterministic, transparent cost-sharing estimate for a ride.
 *
 * Prices are integer cents. Distance is supplied in meters, matching the
 * route contract used by the rides feature. This is an estimate only: it is
 * not a payment, fare, or platform fee calculation.
 */

export const METERS_PER_MILE = 1_609.344;

export const DEFAULT_ASSUMED_MPG = 28;
export const DEFAULT_FUEL_PRICE_CENTS_PER_GALLON = 450;
export const DEFAULT_TOLLS_CENTS = 0;

export interface PricingAssumptions {
  assumedMpg: number;
  fuelPriceCentsPerGallon: number;
  tollsCents: number;
}

/** Accepted overrides for the form and the persisted ride fields. */
export type PricingAssumptionOverrides = Partial<PricingAssumptions> & {
  /** Short alias useful for form state. */
  mpg?: number;
};

export const DEFAULT_PRICING_ASSUMPTIONS: PricingAssumptions = Object.freeze({
  assumedMpg: DEFAULT_ASSUMED_MPG,
  fuelPriceCentsPerGallon: DEFAULT_FUEL_PRICE_CENTS_PER_GALLON,
  tollsCents: DEFAULT_TOLLS_CENTS,
});

export interface SuggestedContributionEstimate {
  distanceMeters: number;
  distanceMiles: number;
  riderSeatCapacity: number;
  fuelCostCents: number;
  tollsCents: number;
  totalTripCostCents: number;
  perSeatContributionCents: number;
  assumptions: PricingAssumptions;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function assertNonNegativeFinite(value: number, field: string): void {
  if (!isFiniteNumber(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative finite number.`);
  }
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative integer.`);
  }
}

function assertPositiveFinite(value: number, field: string): void {
  if (!isFiniteNumber(value) || value <= 0) {
    throw new RangeError(`${field} must be greater than zero.`);
  }
}

/** Resolve optional form overrides while retaining the transparent defaults. */
export function resolvePricingAssumptions(
  overrides: PricingAssumptionOverrides = {},
): PricingAssumptions {
  const assumedMpg = overrides.assumedMpg ?? overrides.mpg ?? DEFAULT_ASSUMED_MPG;
  const fuelPriceCentsPerGallon =
    overrides.fuelPriceCentsPerGallon ?? DEFAULT_FUEL_PRICE_CENTS_PER_GALLON;
  const tollsCents = overrides.tollsCents ?? DEFAULT_TOLLS_CENTS;

  assertPositiveFinite(assumedMpg, "assumedMpg");
  if (!Number.isSafeInteger(fuelPriceCentsPerGallon) || fuelPriceCentsPerGallon < 0) {
    throw new RangeError("fuelPriceCentsPerGallon must be a non-negative integer.");
  }
  assertNonNegativeInteger(tollsCents, "tollsCents");

  return { assumedMpg, fuelPriceCentsPerGallon, tollsCents };
}

/**
 * Return a readable explanation suitable for the create-ride price helper.
 * Example: "28 MPG · $4.50/gal · $0.00 tolls".
 */
export function formatPricingAssumptions(overrides?: PricingAssumptionOverrides): string {
  const assumptions = resolvePricingAssumptions(overrides);
  return `${assumptions.assumedMpg} MPG · ${formatCents(assumptions.fuelPriceCentsPerGallon)}/gal · ${formatCents(assumptions.tollsCents)} tolls`;
}

/** Format a non-negative integer-cent amount as dollars and cents. */
export function formatCents(cents: number): string {
  assertNonNegativeInteger(cents, "cents");
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

/**
 * Calculate the complete estimate. The final per-seat amount is rounded up
 * to the nearest cent so the displayed contribution never under-recovers the
 * calculated trip cost. `riderSeatCapacity` intentionally excludes the driver.
 */
export function estimateSuggestedContribution(
  distanceMeters: number,
  riderSeatCapacity: number,
  overrides?: PricingAssumptionOverrides,
): SuggestedContributionEstimate {
  assertNonNegativeFinite(distanceMeters, "distanceMeters");
  if (!Number.isSafeInteger(riderSeatCapacity) || riderSeatCapacity <= 0) {
    throw new RangeError("riderSeatCapacity must be a positive integer.");
  }

  const assumptions = resolvePricingAssumptions(overrides);
  const distanceMiles = distanceMeters / METERS_PER_MILE;
  const fuelCostCents =
    (distanceMiles / assumptions.assumedMpg) * assumptions.fuelPriceCentsPerGallon;
  const totalTripCostCents = Math.ceil(fuelCostCents + assumptions.tollsCents);

  return {
    distanceMeters,
    distanceMiles,
    riderSeatCapacity,
    fuelCostCents: Math.ceil(fuelCostCents),
    tollsCents: assumptions.tollsCents,
    totalTripCostCents,
    perSeatContributionCents: Math.ceil(
      (fuelCostCents + assumptions.tollsCents) / riderSeatCapacity,
    ),
    assumptions,
  };
}

/** Return only the integer-cent amount needed by a ride draft. */
export function calculateSuggestedContributionCents(
  distanceMeters: number,
  riderSeatCapacity: number,
  overrides?: PricingAssumptionOverrides,
): number {
  return estimateSuggestedContribution(distanceMeters, riderSeatCapacity, overrides)
    .perSeatContributionCents;
}

/** Descriptive alias for callers that prefer the per-seat terminology. */
export const calculateSuggestedPerSeatContributionCents = calculateSuggestedContributionCents;
