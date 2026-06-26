import type { LatLng } from "@/lib/types/help-request";

const COORD_PAIR_PATTERN =
  /^\s*(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)/;

export function parseCoordinates(input: string): LatLng | null {
  const match = input.trim().match(COORD_PAIR_PATTERN);
  if (!match) {
    return null;
  }

  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

export function formatCoordinates(location: LatLng): string {
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
}
