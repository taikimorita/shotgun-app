import { currentUser } from "../../data/fixtures";
import { mockBookingService } from "../mockBookingService";

function fail(message: string): never {
  throw new Error(message);
}

async function assertRejects(action: () => Promise<unknown>, expectedMessage: string) {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === expectedMessage) return;
    fail(`Expected ${JSON.stringify(expectedMessage)}, received ${JSON.stringify(message)}`);
  }
  fail(`Expected rejection: ${expectedMessage}`);
}

async function run() {
  mockBookingService.reset();

  await assertRejects(
    () => mockBookingService.request("ride-maya-slo-sfo", currentUser),
    "You can’t request a seat on your own ride.",
  );

  const booking = await mockBookingService.request("ride-jordan-slo-la", currentUser);
  if (booking.status !== "pending" || booking.rideId !== "ride-jordan-slo-la") {
    fail(`Expected a pending Jordan ride request, received ${JSON.stringify(booking)}`);
  }

  await assertRejects(
    () => mockBookingService.request("ride-jordan-slo-la", currentUser),
    "You already have an active request for this ride.",
  );

  await assertRejects(
    () => mockBookingService.request("ride-aria-slo-sb", currentUser),
    "This ride is full.",
  );

  await assertRejects(
    () => mockBookingService.request("missing-ride", currentUser),
    "Ride not found.",
  );

  mockBookingService.reset();
  console.log("mock booking service tests passed");
}

run().catch((error) => {
  console.error(error);
  throw error;
});
