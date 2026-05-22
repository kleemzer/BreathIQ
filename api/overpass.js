// Serverless proxy for Overpass API — bypasses browser CORS restriction.
// CommonJS format required for Vercel Node.js runtime auto-detection.
const https = require('https');
const http  = require('http');

function fetchOverpass(endpoint, query) {
  return new Promise((resolve, reject) => {
    const postData = 'data=' + encodeURIComponent(query);
    const url = new URL(endpoint);
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent':     'BreathIQ/1.0',
      },
      timeout: 18000,
    };
    const req = lib.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error('HTTP ' + res.statusCode + ' from ' + endpoint));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from ' + endpoint)); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout ' + endpoint)); });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let query;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    query = body && body.data;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing "data" field in request body' });
  }
  if (!query.trim().startsWith('[out:json]')) {
    return res.status(400).json({ error: 'Invalid query format' });
  }

  const ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
  ];

  let lastError;
  for (const endpoint of ENDPOINTS) {
    try {
      const json = await fetchOverpass(endpoint, query);
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return res.status(200).json(json);
    } catch (err) {
      lastError = err;
    }
  }

  return res.status(502).json({ error: 'All Overpass endpoints failed', detail: lastError && lastError.message });
};
