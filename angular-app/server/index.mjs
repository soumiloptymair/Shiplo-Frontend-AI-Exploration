/**
 * USPS API proxy for the Shiplo Angular app.
 *
 * Exposes a tiny HTTP API consumed by the Receiver form (Step 2 of the
 * New Shipment modal):
 *   GET  /api/usps/health
 *   GET  /api/usps/city-state?zip=12345          -> { city, state, zip }
 *   POST /api/usps/validate { street1, street2?, city, state, zip }
 *                                                -> standardized address
 *
 * The Angular dev server (port 5000) proxies /api/* here (port 3001) via
 * angular-app/proxy.conf.json so the browser never sees USPS credentials.
 *
 * Requires environment secrets: USPS_CLIENT_ID, USPS_CLIENT_SECRET.
 * Uses the OAuth 2.0 client_credentials grant; tokens are cached in-memory
 * and refreshed ~1 minute before expiry.
 */
import express from 'express';

const PORT = Number(process.env.USPS_PROXY_PORT ?? 3001);
const TOKEN_URL = 'https://apis.usps.com/oauth2/v3/token';
const ADDR_BASE = 'https://apis.usps.com/addresses/v3';

const CLIENT_ID = process.env.USPS_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.USPS_CLIENT_SECRET ?? '';

/** @type {{ token: string, expiresAt: number } | null} */
let cachedToken = null;

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    const err = new Error('USPS credentials not configured (set USPS_CLIENT_ID and USPS_CLIENT_SECRET).');
    err.status = 503;
    throw err;
  }
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`USPS token request failed (${res.status}): ${text}`);
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + ((data.expires_in ?? 3600) * 1000),
  };
  return cachedToken.token;
}

async function uspsGet(path) {
  const token = await getAccessToken();
  const res = await fetch(`${ADDR_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    const err = new Error(body?.error?.message || `USPS request failed (${res.status})`);
    err.status = res.status;
    err.detail = body;
    throw err;
  }
  return body;
}

const app = express();
app.use(express.json({ limit: '32kb' }));

app.get('/api/usps/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(CLIENT_ID && CLIENT_SECRET) });
});

/** ZIP → City/State autofill. */
app.get('/api/usps/city-state', async (req, res) => {
  try {
    const zip = String(req.query.zip ?? '').replace(/\D/g, '').slice(0, 5);
    if (zip.length !== 5) {
      return res.status(400).json({ error: 'zip must be 5 digits' });
    }
    const data = await uspsGet(`/city-state?ZIPCode=${encodeURIComponent(zip)}`);
    res.json({
      city: data.city ?? '',
      state: data.state ?? '',
      zip: data.ZIPCode ?? zip,
    });
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.message, detail: e.detail });
  }
});

/** Full address standardization / validation. */
app.post('/api/usps/validate', async (req, res) => {
  try {
    const { street1 = '', street2 = '', city = '', state = '', zip = '' } = req.body ?? {};
    if (!street1 || (!zip && (!city || !state))) {
      return res.status(400).json({
        error: 'Provide street1 and either zip or (city + state).',
      });
    }
    const params = new URLSearchParams();
    params.set('streetAddress', street1);
    if (street2) params.set('secondaryAddress', street2);
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (zip) params.set('ZIPCode', String(zip).replace(/\D/g, '').slice(0, 5));
    const data = await uspsGet(`/address?${params.toString()}`);
    const a = data.address ?? data;
    res.json({
      valid: true,
      street1: a.streetAddress ?? '',
      street2: a.secondaryAddress ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
      zip: a.ZIPCode ?? '',
      zipPlus4: a.ZIPPlus4 ?? '',
    });
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.message, detail: e.detail });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`[usps-proxy] listening on http://127.0.0.1:${PORT} (configured=${Boolean(CLIENT_ID && CLIENT_SECRET)})`);
});
