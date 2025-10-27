// /api/mhrs-proxy.ts
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const TUNNEL = process.env.TUNNEL_URL; // Vercel env’den gelecek
  if (!TUNNEL) return res.status(500).json({ error: 'TUNNEL_URL missing' });

  try {
    const upstream = await fetch(`${TUNNEL}/api`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': req.headers['accept-language'] || 'tr-TR,tr;q=0.9',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

    const status = upstream.status;
    const text = await upstream.text();
    const ctype = upstream.headers.get('content-type') || 'text/plain';
    return res.status(status).setHeader('content-type', ctype).send(text);
  } catch (e) {
    return res.status(504).json({ error: 'tunnel_timeout_or_block', detail: String(e?.message || e) });
  }
}
