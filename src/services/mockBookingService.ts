import { initialBookings } from "../data/fixtures";
import { Booking, BookingStatus } from "../types/booking";

type Listener = (bookings: Booking[]) => void;

let bookings = [...initialBookings];
const listeners = new Set<Listener>();

function publish() {
  const snapshot = [...bookings];
  listeners.forEach((listener) => listener(snapshot));
}

function wait() {
  return new Promise<void>((resolve) => setTimeout(resolve, 250));
}

export const mockBookingService = {
  list: async () => [...bookings],
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener([...bookings]);
    return () => {
      listeners.delete(listener);
    };
  },
  async request(rideId: string, rider: { id: string; name: string; initials: string }) {
    await wait();
    const existing = bookings.find((booking) => booking.rideId === rideId && booking.riderId === rider.id);
    if (existing && existing.status !== "cancelled" && existing.status !== "declined") {
      throw new Error("You already have an active request for this ride.");
    }
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      rideId,
      riderId: rider.id,
      riderName: rider.name,
      riderInitials: rider.initials,
      seats: 1,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    bookings = [...bookings, booking];
    publish();
    return booking;
  },
  async setStatus(bookingId: string, status: Extract<BookingStatus, "accepted" | "declined" | "cancelled">) {
    await wait();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw new Error("Booking not found.");
    bookings = bookings.map((item) => (item.id === bookingId ? { ...item, status } : item));
    publish();
  },
  reset() {
    bookings = [...initialBookings];
    publish();
  },
};
