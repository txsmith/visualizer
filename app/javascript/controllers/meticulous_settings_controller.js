import { Controller } from "@hotwired/stimulus"
import { normalizeUrl, writeStatus } from "helpers/meticulous"
import { deviceInfo } from "helpers/meticulous_api"

// Settings page: toggle the Meticulous integration on/off and test connectivity
// to the configured machine URL. The machine serves a self-signed cert, so the
// first connection requires accepting it once (writeStatus offers a helper link).
export default class extends Controller {
  static targets = ["machineUrl", "config", "toggle", "status", "button"]

  // Reveal/hide the URL + Test config when the enable checkbox changes.
  toggleEnabled() {
    this.configTarget.classList.toggle("hidden", !this.toggleTarget.checked)
  }

  async test() {
    const base = normalizeUrl(this.machineUrlTarget.value)
    if (!base) {
      writeStatus(this.statusTarget, "Enter your machine's address first, e.g. https://meticulous.local", { isError: true })
      return
    }
    this.buttonTarget.disabled = true
    writeStatus(this.statusTarget, "Testing connection…")
    try {
      const info = await deviceInfo(base)
      writeStatus(this.statusTarget, `Connected to ${info.name || "your machine"} ✓`)
    } catch (e) {
      writeStatus(
        this.statusTarget,
        `Couldn't reach ${base}. If this is the first time, open the machine url and accept its certificate, then test again. (${e.message})`,
        { isError: true, trustUrl: base },
      )
    } finally {
      this.buttonTarget.disabled = false
    }
  }
}
