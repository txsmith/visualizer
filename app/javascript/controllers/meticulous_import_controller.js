import { Controller } from "@hotwired/stimulus"
import { Turbo } from "@hotwired/turbo-rails"
import { post } from "@rails/request.js"
import { normalizeUrl, withProfileName, writeStatus, formatHttpError } from "helpers/meticulous"
import { recentShots, shotsByIds } from "helpers/meticulous_api"

// Upload page: pick shots from the Meticulous machine and import them.
//
// The machine exposes its history at GET /api/v1/history and sends
// `Access-Control-Allow-Origin: *`, so the browser can fetch it cross-origin.
// We list recent shots, let the user select several, then fetch only the selected 
// ones with full data and upload them through the normal shot-create flow.
//
// HTTPS / certificate: the machine serves a self-signed cert, so a
// background fetch fails until the user accepts it once (the status helper links
// to the machine to do that).
export default class extends Controller {
  static targets = ["dialog", "list", "loading", "loadingLabel", "status", "dialogStatus", "shotCheckbox", "importButton", "rowTemplate"]
  static values = { submitUrl: String, machineUrl: String }

  async openDialog() {
    const base = normalizeUrl(this.machineUrlValue)
    if (!base) {
      writeStatus(this.statusTarget, "Set your machine URL in Settings first.", { isError: true })
      return
    }
    this.dialogTarget.showModal()
    writeStatus(this.dialogStatusTarget, "")
    this.listTarget.innerHTML = ""
    this.showLoading(true, "Loading recent shots…")

    try {
      const history = await recentShots(base)
      this.showLoading(false)
      this.renderList(history)
    } catch (e) {
      this.showLoading(false)
      writeStatus(
        this.dialogStatusTarget,
        `Couldn't reach ${base}. If this is the first time, accept the machine's certificate, then reopen.`,
        { isError: true, trustUrl: base },
      )
    }
  }

  closeDialog() {
    this.dialogTarget.close()
  }

  showLoading(on, text) {
    if (text) this.loadingLabelTarget.textContent = text
    this.loadingTarget.classList.toggle("hidden", !on)
    this.listTarget.classList.toggle("hidden", on)
  }

  renderList(shots) {
    this.listTarget.innerHTML = ""
    if (!shots.length) {
      this.listTarget.innerHTML = `<p class="py-6 text-sm text-center text-neutral-500">No shots found on the machine.</p>`
      return
    }
    for (const s of shots) {
      const row = this.rowTemplateTarget.content.cloneNode(true)
      row.querySelector("input[type=checkbox]").value = s.id
      row.querySelector("[data-row=name]").textContent = s.name || (s.profile && s.profile.name) || "Shot"
      row.querySelector("[data-row=time]").textContent = s.time ? new Date(s.time * 1000).toLocaleString() : ""
      this.listTarget.appendChild(row)
    }
  }

  async importSelected() {
    const ids = this.shotCheckboxTargets.filter((c) => c.checked).map((c) => c.value)
    if (!ids.length) {
      writeStatus(this.dialogStatusTarget, "Select at least one shot.", { isError: true })
      return
    }
    const base = normalizeUrl(this.machineUrlValue)
    const n = ids.length
    this.importButtonTarget.disabled = true
    writeStatus(this.dialogStatusTarget, "")
    this.showLoading(true, `Fetching ${n} shot${n > 1 ? "s" : ""}…`)

    let shots
    try {
      shots = await shotsByIds(base, ids)
    } catch (e) {
      this.showLoading(false)
      this.importButtonTarget.disabled = false
      writeStatus(this.dialogStatusTarget, `Fetch failed: ${e.message}`, { isError: true, trustUrl: base })
      return
    }

    const formData = new FormData()
    for (const s of shots) {
      withProfileName(s)
      formData.append("files[]", new File([JSON.stringify(s)], `meticulous-${s.id}.shot.json`, { type: "application/json" }))
    }

    this.showLoading(true, `Uploading ${shots.length} shot${shots.length > 1 ? "s" : ""}…`)
    try {
      const response = await post(`${this.submitUrlValue}?drag=1`, { body: formData, responseKind: "turbo-stream" })
      if (response.ok) {
        this.closeDialog()
        Turbo.visit("/shots")
      } else {
        this.showLoading(false)
        this.importButtonTarget.disabled = false
        const body = await response.text.catch(() => "")
        writeStatus(this.dialogStatusTarget, `Upload failed — ${formatHttpError(response.statusCode, body)}`, { isError: true })
      }
    } catch (e) {
      this.showLoading(false)
      this.importButtonTarget.disabled = false
      writeStatus(this.dialogStatusTarget, `Upload failed: ${e.message}`, { isError: true })
    }
  }
}
