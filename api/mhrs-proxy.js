export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, X-CSRF-Token');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const URL = 'https://prd.mhrs.gov.tr/api/kurum-rss/randevu/slot-sorgulama/arama';

  try {
    const headers = {
      'Authorization': req.headers.authorization || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.6,en;q=0.5',
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://prd.mhrs.gov.tr/',
      'Origin': 'https://prd.mhrs.gov.tr',
      ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {})
    };

    const upstream = await fetch(URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

    const status = upstream.status;
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || '';

    res.status(status);
    if (contentType.includes('application/json')) {
      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } else {
      return res.send(text);
    }
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: e.message });
  }
}
