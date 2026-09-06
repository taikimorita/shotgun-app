declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type PlaceInput = { lat: number; lng: number };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isPlaceInput(value: unknown): value is PlaceInput {
  return isRecord(value) && isCoordinate(value.lat, -90, 90) && isCoordinate(value.lng, -180, 180);
}

function hasMapsAccess(request: Request) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  try {
    const encodedPayload = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "";
    const payload = JSON.parse(atob(encodedPayload)) as unknown;
    return isRecord(payload) && (payload.role === "anon" || payload.role === "authenticated");
  } catch {
    return false;
  }
}

async function fetchGeoapify(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Geoapify request failed");
    return await response.json() as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

async function searchPlaces(query: string, apiKey: string) {
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.search = new URLSearchParams({
    text: query,
    format: "json",
    countrycodes: "us",
    bias: "proximity:-120.6596,35.2828",
    limit: "6",
    lang: "en",
    apiKey,
  }).toString();
  const payload = await fetchGeoapify(url);
  const results = isRecord(payload) && Array.isArray(payload.results) ? payload.results : [];
  const seen = new Set<string>();
  const places = results.flatMap((value) => {
    if (!isRecord(value) || !isCoordinate(value.lat, -90, 90) || !isCoordinate(value.lon, -180, 180)) return [];
    const label = typeof value.formatted === "string" ? value.formatted : typeof value.name === "string" ? value.name : "";
    if (!label) return [];
    const id = typeof value.place_id === "string" ? value.place_id : `geoapify-${value.lat}-${value.lon}`;
    if (seen.has(id)) return [];
    seen.add(id);
    return [{ id, label, lat: value.lat, lng: value.lon }];
  });
  return json({ places });
}

async function getRoute(stops: PlaceInput[], apiKey: string) {
  const url = new URL("https://api.geoapify.com/v1/routing");
  url.search = new URLSearchParams({
    waypoints: stops.map((stop) => `${stop.lat},${stop.lng}`).join("|"),
    mode: "drive",
    units: "metric",
    format: "geojson",
    apiKey,
  }).toString();
  const payload = await fetchGeoapify(url);
  const feature = isRecord(payload) && Array.isArray(payload.features) ? payload.features[0] : null;
  const properties = isRecord(feature) && isRecord(feature.properties) ? feature.properties : null;
  const geometry = isRecord(feature) && isRecord(feature.geometry) ? feature.geometry : null;
  const lines = geometry && Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
  const routeLines = lines.map((line) => {
    if (!Array.isArray(line)) return [];
    return line.flatMap((point) => {
      if (!Array.isArray(point) || !isCoordinate(point[0], -180, 180) || !isCoordinate(point[1], -90, 90)) return [];
      return [{ lat: point[1], lng: point[0] }];
    });
  });
  const pointCount = routeLines.reduce((total, line) => total + line.length, 0);
  const stride = Math.max(1, Math.ceil(pointCount / 700));
  const path = routeLines.flatMap((line) => line.filter((_, index) => index % stride === 0 || index === line.length - 1));
  if (!properties || typeof properties.distance !== "number" || typeof properties.time !== "number" || path.length < 2) {
    throw new Error("Geoapify returned no route");
  }
  return json({ route: { distanceMeters: Math.round(properties.distance), durationSeconds: Math.round(properties.time), path } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!hasMapsAccess(request)) return json({ error: "Valid Supabase client token required" }, 401);

  const apiKey = Deno.env.get("GEOAPIFY_API_KEY");
  if (!apiKey) return json({ error: "Maps service is not configured" }, 503);

  try {
    const body = await request.json() as unknown;
    if (!isRecord(body)) return json({ error: "Invalid request" }, 400);
    if (body.operation === "search") {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (query.length < 2 || query.length > 160) return json({ error: "Search query must be 2–160 characters" }, 400);
      return await searchPlaces(query, apiKey);
    }
    if (body.operation === "route") {
      const stops = Array.isArray(body.stops) ? body.stops : [];
      if (stops.length < 2 || stops.length > 8 || !stops.every(isPlaceInput)) return json({ error: "Route requires 2–8 valid stops" }, 400);
      return await getRoute(stops, apiKey);
    }
    return json({ error: "Unsupported maps operation" }, 400);
  } catch {
    return json({ error: "Live maps are temporarily unavailable" }, 502);
  }
});
