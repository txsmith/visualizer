// Thin client for the Meticulous machine's on-device HTTP API.
//
// All calls take an already-normalized base URL (e.g. "https://meticulous.local";
// see normalizeUrl in helpers/meticulous) and reject with an Error on a non-OK
// response. A network/TLS failure rejects with the browser's TypeError, which
// callers surface as a "couldn't reach / accept the certificate" hint.

import { formatHttpError } from "helpers/meticulous"

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) throw new Error(formatHttpError(res.status, await res.text().catch(() => "")))
  return res.json()
}

// GET /api/v1/machine — device info (name, serial, firmware, …).
export function deviceInfo(base) {
  return getJSON(`${base}/api/v1/machine`)
}

// GET /api/v1/history — light listing of recent shots (metadata only, no samples).
export async function recentShots(base, max = 20) {
  const { history } = await getJSON(`${base}/api/v1/history?max_results=${max}&dump_data=false`)
  return history || []
}

// GET /api/v1/history?ids=… — the given shots with full sample data.
export async function shotsByIds(base, ids) {
  const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join("&")
  const { history } = await getJSON(`${base}/api/v1/history?dump_data=true&${query}`)
  return history || []
}
