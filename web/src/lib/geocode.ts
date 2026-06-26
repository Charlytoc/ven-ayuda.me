import type { LatLng } from "@/lib/types/help-request";

export type GeocodeResult = LatLng & {
  label: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("No se pudo buscar el lugar.");
  }

  const data = (await response.json()) as NominatimResult[];
  return data
    .map((item) => {
      const lat = Number.parseFloat(item.lat);
      const lng = Number.parseFloat(item.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return { lat, lng, label: item.display_name };
    })
    .filter((item): item is GeocodeResult => item != null);
}
