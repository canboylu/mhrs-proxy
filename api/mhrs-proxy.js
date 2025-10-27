export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://prd.mhrs.gov.tr/api/kurum-rss/randevu/slot-sorgulama/arama',
      {
        method: 'POST',
        headers: {
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      }
    );

    // Önce response text olarak al
    const responseText = await response.text();
    
    // Boş response kontrolü
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from MHRS API');
      return res.status(502).json({ 
        error: 'MHRS API boş yanıt döndürdü. Token süresi dolmuş olabilir.' 
      });
    }

    // JSON parse et
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', responseText);
      return res.status(502).json({ 
        error: 'MHRS API geçersiz JSON döndürdü',
        raw: responseText.substring(0, 100) // İlk 100 karakter
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'MHRS API\'ye erişim sağlanamadı' 
    });
  }
}
