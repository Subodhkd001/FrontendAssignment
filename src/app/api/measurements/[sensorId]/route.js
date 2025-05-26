export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sensorId = request.url.split("/").pop();
  const limit = searchParams.get("limit") || 1;
    const API_KEY = process.env.OPENAQ_API_KEY;

  const res = await fetch(`https://api.openaq.org/v3/sensors/${sensorId}/measurements?limit=${limit}`, {
    headers: {
      "X-API-Key": API_KEY
    }
  });

  if (!res.ok) {
    return new Response("Failed to fetch measurements", { status: res.status });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
