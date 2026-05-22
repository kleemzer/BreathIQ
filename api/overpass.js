// Serverless proxy for Overpass API — bypasses browser CORS restriction.
// Receives: POST body { data: "<overpass QL query>" }
// Returns:  JSON from overpass-api.de, with 5-min cache header.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let query;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    query = body?.data;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing "data" field in request body' });
  }

  // Basic sanity check: reject anything that isn't an Overpass QL query
  if (!query.trim().startsWith('[out:json]')) {
    return res.status(400).json({ error: 'Invalid query format' });
  }

  const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
  ];

  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000),
      });

      if (!upstream.ok) {
        lastError = new Error(`HTTP ${upstream.status} from ${endpoint}`);
        continue;
      }

      const json = await upstream.json();
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(json);
    } catch (err) {
      lastError = err;
    }
  }

  return res.status(502).json({ error: 'All Overpass endpoints failed', detail: lastError?.message });
}
