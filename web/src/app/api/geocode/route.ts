const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "ven-ayuda.me/1.0 (emergency help map)";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return Response.json([]);
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "ve");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Geocoding service unavailable" },
      { status: 502 },
    );
  }

  const results = (await response.json()) as NominatimResult[];
  return Response.json(results);
}
