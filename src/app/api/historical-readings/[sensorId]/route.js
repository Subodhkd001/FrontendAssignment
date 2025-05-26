export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url);

  const segments = pathname.split('/');
  const sensorId = segments[segments.length - 1]; 

  const datetime_from = searchParams.get('datetime_from');
  const datetime_to = searchParams.get('datetime_to');
  const limit = searchParams.get('limit') || 100;

  const API_KEY = process.env.OPENAQ_API_KEY;

  const apiUrl = new URL(`https://api.openaq.org/v3/sensors/${sensorId}/measurements/daily`);
  apiUrl.searchParams.set('limit', limit);
  if (datetime_from) apiUrl.searchParams.set('datetime_from', datetime_from);
  if (datetime_to) apiUrl.searchParams.set('datetime_to', datetime_to);

  try {
    const res = await fetch(apiUrl.toString(), {
      headers: { 'x-api-key': API_KEY }
    });

    if (!res.ok) throw new Error('Failed to fetch historical data');
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
