export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const WEBHOOK_URL = process.env.GSCRIPT_WEBHOOK_URL;
  if (!WEBHOOK_URL) {
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  try {
    const gsRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!gsRes.ok) {
      const text = await gsRes.text();
      console.error('Google Script error:', gsRes.status, text);
      return res.status(502).json({ error: 'External service error' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({ error: err.message });
  }
}
