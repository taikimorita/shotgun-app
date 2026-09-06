import * as Location from "expo-location";

import type { Place } from "../features/rides/types";

export interface LocationService {
  getCurrentPlace(): Promise<Place>;
}

export function toCurrentPlace(coords: { latitude: number; longitude: number }): Place {
  return {
    id: "device-current-location",
    label: "Current location",
    lat: coords.latitude,
    lng: coords.longitude,
  };
}

export const expoLocationService: LocationService = {
  async getCurrentPlace() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new Error("Location access is off. Search for a pickup instead.");
    const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return toCurrentPlace(result.coords);
  },
};
