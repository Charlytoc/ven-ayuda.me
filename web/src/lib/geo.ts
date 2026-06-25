import type { HelpRequest, LatLng } from "@/lib/types/help-request";

export const NEARBY_RADIUS_KM = 50;
export const ALERTS_PAGE_SIZE = 8;
export const GEO_COORD_DECIMAL_PLACES = 6;

const EARTH_RADIUS_KM = 6371;

export function roundGeoCoord(value: number): number {
  const factor = 10 ** GEO_COORD_DECIMAL_PLACES;
  return Math.round(value * factor) / factor;
}

export function haversineDistanceKm(
  from: LatLng,
  to: LatLng,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function requestCoordinates(request: HelpRequest): LatLng | null {
  const lat = Number(request.latitude);
  const lng = Number(request.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

export function filterRequestsNearby(
  requests: HelpRequest[],
  origin: LatLng,
  radiusKm: number = NEARBY_RADIUS_KM,
): HelpRequest[] {
  return requests.filter((request) => {
    const coords = requestCoordinates(request);
    if (!coords) {
      return false;
    }
    return haversineDistanceKm(origin, coords) <= radiusKm;
  });
}

export function distanceToRequestKm(
  origin: LatLng,
  request: HelpRequest,
): number | null {
  const coords = requestCoordinates(request);
  if (!coords) {
    return null;
  }
  return haversineDistanceKm(origin, coords);
}

export function formatDistanceKm(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/** Axis-aligned bounds that contain a circle of radiusKm around center (for map fitBounds). */
export function circleBounds(
  center: LatLng,
  radiusKm: number,
): [[number, number], [number, number]] {
  const radiusM = radiusKm * 1000;
  const latRad = (center.lat * Math.PI) / 180;
  const latOffset = radiusM / 111_320;
  const lngOffset = radiusM / (111_320 * Math.cos(latRad));
  return [
    [center.lat - latOffset, center.lng - lngOffset],
    [center.lat + latOffset, center.lng + lngOffset],
  ];
}

export function sortRequestsByDistance(
  requests: HelpRequest[],
  origin: LatLng,
): HelpRequest[] {
  return [...requests].sort((a, b) => {
    const distA = distanceToRequestKm(origin, a) ?? Infinity;
    const distB = distanceToRequestKm(origin, b) ?? Infinity;
    return distA - distB;
  });
}
