export async function GET(request) {
  const url = new URL(request.url);

  const segments = url.pathname.split('/');
  const locationId = segments[segments.length - 1];

   const API_KEY = process.env.OPENAQ_API_KEY;

  const res = await fetch(`https://api.openaq.org/v3/locations/${locationId}/latest`, {
    headers: { "X-API-Key": API_KEY }
  });

  if (!res.ok) {
    return new Response("Failed to fetch latest readings", { status: res.status });
  }

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
