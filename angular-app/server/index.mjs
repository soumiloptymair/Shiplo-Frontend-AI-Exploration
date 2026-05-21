/**
 * Address proxy for the Shiplo Angular app (Step 2 of New Shipment).
 *
 * Endpoints:
 *   GET  /api/usps/health
 *   GET  /api/usps/city-state?zip=12345    -> { city, state, zip }
 *   POST /api/usps/validate { street1, street2?, city, state, zip }
 *                                          -> standardized address
 *
 * Provider strategy (in this order):
 *   1. USPS Addresses 3.0 — used if USPS_CLIENT_ID + USPS_CLIENT_SECRET are
 *      set. The browser never sees these credentials.
 *   2. Free fallback — Zippopotam.us for ZIP -> City/State, and the US
 *      Census Bureau Geocoder for full-address standardization. No keys
 *      required, so the feature works out of the box.
 *
 * The endpoint paths are kept as `/api/usps/*` so the Angular service
 * contract does not change when providers are swapped.
 */
import express from 'express';

const PORT = Number(process.env.USPS_PROXY_PORT ?? 3001);

const USPS_TOKEN_URL = 'https://apis.usps.com/oauth2/v3/token';
const USPS_ADDR_BASE = 'https://apis.usps.com/addresses/v3';
const USPS_CLIENT_ID = process.env.USPS_CLIENT_ID ?? '';
const USPS_CLIENT_SECRET = process.env.USPS_CLIENT_SECRET ?? '';
const USPS_ENABLED = Boolean(USPS_CLIENT_ID && USPS_CLIENT_SECRET);

const ZIPPOPOTAM_BASE = 'https://api.zippopotam.us/us';
const CENSUS_ONELINE =
  'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';

/** @type {{ token: string, expiresAt: number } | null} */
let uspsToken = null;

async function getUspsToken() {
  if (uspsToken && uspsToken.expiresAt - Date.now() > 60_000) return uspsToken.token;
  const res = await fetch(USPS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: USPS_CLIENT_ID,
      client_secret: USPS_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw httpError(502, `USPS token failed (${res.status})`);
  const data = await res.json();
  uspsToken = {
    token: data.access_token,
    expiresAt: Date.now() + ((data.expires_in ?? 3600) * 1000),
  };
  return uspsToken.token;
}

function httpError(status, message, detail) {
  const e = new Error(message);
  e.status = status;
  if (detail !== undefined) e.detail = detail;
  return e;
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) throw httpError(res.status, `Upstream ${res.status}`, body);
  return body;
}

// ─── ZIP → City/State ────────────────────────────────────────────────────────

async function zipToCityStateUsps(zip) {
  const token = await getUspsToken();
  const data = await fetchJson(
    `${USPS_ADDR_BASE}/city-state?ZIPCode=${encodeURIComponent(zip)}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
  );
  return { city: data.city ?? '', state: data.state ?? '', zip: data.ZIPCode ?? zip };
}

async function zipToCityStateZippopotam(zip) {
  const data = await fetchJson(`${ZIPPOPOTAM_BASE}/${encodeURIComponent(zip)}`);
  const place = data?.places?.[0];
  if (!place) throw httpError(404, 'ZIP not found');
  return {
    city: place['place name'] ?? '',
    state: place['state abbreviation'] ?? '',
    zip: data['post code'] ?? zip,
  };
}

// ─── Full-address validation / standardization ───────────────────────────────

async function validateUsps({ street1, street2, city, state, zip }) {
  const token = await getUspsToken();
  const params = new URLSearchParams();
  params.set('streetAddress', street1);
  if (street2) params.set('secondaryAddress', street2);
  if (city) params.set('city', city);
  if (state) params.set('state', state);
  if (zip) params.set('ZIPCode', zip);
  const data = await fetchJson(
    `${USPS_ADDR_BASE}/address?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
  );
  const a = data.address ?? data;
  return {
    valid: true,
    street1: a.streetAddress ?? '',
    street2: a.secondaryAddress ?? '',
    city: a.city ?? '',
    state: a.state ?? '',
    zip: a.ZIPCode ?? '',
    zipPlus4: a.ZIPPlus4 ?? '',
  };
}

async function validateCensus({ street1, street2, city, state, zip }) {
  // Census expects a single-line address.
  const oneLine = [
    [street1, street2].filter(Boolean).join(' '),
    city,
    state,
    zip,
  ].filter(Boolean).join(', ');
  const url =
    `${CENSUS_ONELINE}?address=${encodeURIComponent(oneLine)}` +
    `&benchmark=Public_AR_Current&format=json`;
  const data = await fetchJson(url);
  const match = data?.result?.addressMatches?.[0];
  if (!match) throw httpError(404, 'No match for that address');
  // matchedAddress example: "11500 LAGO VISTA APT 2359, FARMERS BRANCH, TX, 75234"
  const parts = String(match.matchedAddress ?? '')
    .split(',')
    .map((s) => s.trim());
  const [matchedStreet = '', matchedCity = '', matchedState = '', matchedZip = ''] = parts;
  return {
    valid: true,
    street1: matchedStreet,
    street2: '',
    city: matchedCity,
    state: matchedState,
    zip: matchedZip,
    zipPlus4: '',
  };
}

// ─── HTTP layer ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '32kb' }));

app.get('/api/usps/health', (_req, res) => {
  res.json({
    ok: true,
    provider: USPS_ENABLED ? 'usps' : 'census+zippopotam',
    configured: USPS_ENABLED,
  });
});

app.get('/api/usps/city-state', async (req, res) => {
  try {
    const zip = String(req.query.zip ?? '').replace(/\D/g, '').slice(0, 5);
    if (zip.length !== 5) return res.status(400).json({ error: 'zip must be 5 digits' });
    const result = USPS_ENABLED
      ? await zipToCityStateUsps(zip)
      : await zipToCityStateZippopotam(zip);
    res.json(result);
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.message, detail: e.detail });
  }
});

app.post('/api/usps/validate', async (req, res) => {
  try {
    const street1 = String(req.body?.street1 ?? '').trim();
    const street2 = String(req.body?.street2 ?? '').trim();
    const city    = String(req.body?.city ?? '').trim();
    const state   = String(req.body?.state ?? '').trim();
    const zip     = String(req.body?.zip ?? '').replace(/\D/g, '').slice(0, 5);
    if (!street1 || (!zip && (!city || !state))) {
      return res.status(400).json({
        error: 'Provide street1 and either zip or (city + state).',
      });
    }
    const payload = { street1, street2, city, state, zip };
    const result = USPS_ENABLED
      ? await validateUsps(payload)
      : await validateCensus(payload);
    res.json(result);
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.message, detail: e.detail });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  const provider = USPS_ENABLED ? 'USPS Addresses 3.0' : 'US Census + Zippopotam (keyless)';
  // eslint-disable-next-line no-console
  console.log(`[address-proxy] listening on http://127.0.0.1:${PORT} (provider=${provider})`);
});
