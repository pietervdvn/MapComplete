<script lang="ts">
  /**
   * Wrapper around 'ThemeViewGui', which is responsible for some boiler plate things, such as:
   *
   * - Checking for WebGL support
   * - Loading the available layers
   * - ...
   */
  import ThemeViewGUI from "./ThemeViewGUI.svelte"
  import Constants from "../Models/Constants.js"
  import { Utils } from "../Utils.js"
  import { UIEventSource } from "../Logic/UIEventSource"
  import { WithSearchState } from "../Models/ThemeViewState/WithSearchState"
  import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
import { AndroidPolyfill } from "../Logic/Web/AndroidPolyfill"

  function webgl_support() {
    try {
      const canvas = document.createElement("canvas")
      if (
        !!window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      ) {
        return true
      }
    } catch (e) {
      return false
    }
  }

  async function getAvailableLayers(): Promise<Set<string>> {
    if (!Constants.SummaryServer) {
      return new Set<string>()
    }
    try {
      const host = new URL(Constants.SummaryServer).host
      const status: { layers: string[] } = await Promise.any([
        Utils.downloadJson<{ layers }>("https://" + host + "/summary/status.json"),
        Utils.waitFor(2500, { layers: [] }),
      ])
      return new Set<string>(status.layers)
    } catch (e) {
      console.error("Could not get MVT available layers due to", e)
      return new Set<string>()
    }
  }

  export let theme: ThemeConfig
AndroidPolyfill.init()
  let webgl_supported = webgl_support()

  let availableLayers = UIEventSource.FromPromise(getAvailableLayers())
  const state = new WithSearchState(theme, availableLayers)
</script>

{#if !webgl_supported}
  <div class="alert m-8 h-full w-full items-center justify-center">
    WebGL is not supported or not enabled. This is essential for MapComplete to function, please
    enable this.
  </div>
{:else}
  <ThemeViewGUI {state} />
{/if}
