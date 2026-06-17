// Shared helpers for the Meticulous integration (settings + import controllers).

// Normalize a user-entered machine address: default to https, strip trailing /.
export function normalizeUrl(value) {
  let v = (value || "").trim()
  if (!v) return ""
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`
  return v.replace(/\/+$/, "")
}

// Visualizer's parser keys on a top-level `profile_name`; the machine calls it `name`.
export function withProfileName(shot) {
  shot.profile_name = shot.name || (shot.profile && shot.profile.name) || "Meticulous Shot"
  return shot
}

// Build a readable error string from an HTTP status + response body. Pulls the
// message out of a JSON error body ({error|message|details|detail}); for an HTML
// body (e.g. a Rails error page) it strips tags; otherwise uses the raw text.
export function formatHttpError(status, body) {
  let detail = (body || "").trim()
  try {
    const j = JSON.parse(detail)
    detail = j.error || j.message || j.details || j.detail || ""
  } catch {
    if (/^\s*</.test(detail)) detail = detail.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  }
  if (detail.length > 200) detail = `${detail.slice(0, 200)}…`
  return `HTTP ${status}${detail ? `: ${detail}` : ""}`
}

// Write a status line. On a connectivity/cert failure pass `trustUrl` to append a
// one-click "open the machine and accept its certificate" helper.
export function writeStatus(el, message, { isError = false, trustUrl = null } = {}) {
  if (!el) return
  el.textContent = message
  el.classList.toggle("text-red-600", isError)
  el.classList.toggle("text-neutral-500", !isError)
  if (trustUrl) {
    const link = document.createElement("button")
    link.type = "button"
    link.textContent = " Open machine to accept certificate →"
    link.className = "standard-link"
    link.addEventListener("click", () => window.open(`${trustUrl}/`, "_blank", "noopener"))
    el.appendChild(link)
  }
}
