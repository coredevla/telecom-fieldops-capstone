#!/usr/bin/env node
/**
 * Probe /api/v1/work-orders and /api/v1/dashboard/kpis against localhost and Railway
 * to compare responses and surface errors (e.g. Unhandled error / P2022).
 *
 * Usage:
 *   node scripts/probe-work-orders-and-kpis.js
 *   PROBE_RAILWAY_ONLY=1 node scripts/probe-work-orders-and-kpis.js
 *
 * Expects admin user in DB: admin@telecom.local / Admin123!
 */

const LOCAL = 'http://localhost:3000';
const RAILWAY = 'https://telecom-fieldops-capstone-production.up.railway.app';

const LOGIN_BODY = {
  email: 'admin@telecom.local',
  password: 'Admin123!',
};

function log(label, ...args) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${label}`, ...args);
}

const REQUEST_TIMEOUT_MS = 15000;

function fetchWithTimeout(url, opts = {}, ms = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

async function login(baseUrl) {
  const url = `${baseUrl}/api/v1/auth/login`;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(LOGIN_BODY),
  });
  const text = await res.text();
  let data;
  try {
    data = text.startsWith('{') ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!data) {
    log('LOGIN non-JSON or parse error', { status: res.status, bodyPreview: text.slice(0, 200) });
    return { token: null, status: res.status };
  }
  if (!res.ok) {
    log('LOGIN failed', { status: res.status, body: data });
    return { token: null, status: res.status };
  }
  const token = data.accessToken ?? data.access_token;
  if (!token) {
    log('LOGIN no token in response', data);
    return { token: null, status: res.status };
  }
  return { token, status: res.status };
}

async function getJson(baseUrl, path, token) {
  const url = `${baseUrl}${path}`;
  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let data;
  try {
    data = text && text.trim().startsWith('{') ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!data) {
    return { status: res.status, body: text.slice(0, 800), parsed: false };
  }
  return { status: res.status, body: data, parsed: true };
}

async function probe(baseUrl, label) {
  log('---', label, baseUrl, '---');

  const loginResult = await login(baseUrl);
  if (!loginResult.token) {
    log(label, 'LOGIN failed, skip work-orders/kpis', { status: loginResult.status });
    return;
  }
  log(label, 'LOGIN OK');

  const [workOrders, kpis] = await Promise.all([
    getJson(baseUrl, '/api/v1/work-orders', loginResult.token),
    getJson(baseUrl, '/api/v1/dashboard/kpis', loginResult.token),
  ]);

  log(label, 'GET /api/v1/work-orders', { status: workOrders.status });
  if (workOrders.status !== 200) {
    log(label, 'work-orders response', workOrders.body);
  } else if (workOrders.parsed && Array.isArray(workOrders.body)) {
    log(label, 'work-orders count', workOrders.body.length);
  }

  log(label, 'GET /api/v1/dashboard/kpis', { status: kpis.status });
  if (kpis.status !== 200) {
    log(label, 'kpis response', kpis.body);
  } else if (kpis.parsed && kpis.body) {
    log(label, 'kpis keys', Object.keys(kpis.body));
  }
}

async function main() {
  const railwayOnly = process.env.PROBE_RAILWAY_ONLY === '1';

  if (!railwayOnly) {
    await probe(LOCAL, 'LOCAL');
  }
  await probe(RAILWAY, 'RAILWAY');

  log('--- done ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
