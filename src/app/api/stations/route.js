export async function GET() {
    const API_KEY = process.env.OPENAQ_API_KEY;
  const res = await fetch(
    "https://api.openaq.org/v3/locations?coordinates=51.5074,-0.1278&radius=8000&limit=100",
    {
      headers: {
        "X-API-Key": API_KEY,
      },
    }
  );

  if (!res.ok) {
    return new Response("Error fetching stations", { status: res.status });
  }

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
