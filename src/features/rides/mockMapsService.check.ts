import { demoRoutePlaces, mockMapsService } from './mockMapsService';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Focused, dependency-free checks callable from a test runner or dev harness. */
export async function runMockMapsServiceChecks() {
  const calPolyMatches = await mockMapsService.searchPlaces('cal poly');
  assert(calPolyMatches.length === 1, 'Cal Poly search should return one deterministic result.');
  assert((await mockMapsService.searchPlaces('not-a-place')).length === 0, 'Unknown places should return no results.');

  const route = await mockMapsService.getRoute(demoRoutePlaces.origin, demoRoutePlaces.destination);
  assert(route.distanceMeters === 370_000, 'Demo route should use meters.');
  assert(route.durationSeconds === 14_400, 'Demo route should use seconds.');
  assert(demoRoutePlaces.origin.coordinates.latitude === 35.305, 'Places should retain coordinates.');
  assert(demoRoutePlaces.destination.label === 'San Francisco International Airport', 'Places should retain labels.');
}
