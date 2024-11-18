<script lang="ts">
  /**
   * Opens the 'Opening hours input' in another top level window
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import PublicHolidaySelector from "../../OpeningHours/PublicHolidaySelector.svelte"
  import OHTable from "./OpeningHours/OHTable.svelte"
  import OpeningHoursState from "../../OpeningHours/OpeningHoursState"
  import Popup from "../../Base/Popup.svelte"
  import Check from "@babeard/svelte-heroicons/mini/Check"

  export let value: UIEventSource<string>
  export let args: string
  let prefix = ""
  let postfix = ""
  if (args) {
    try {
      const data = JSON.stringify(args)
      if (data["prefix"]) {
        prefix = data["prefix"]
      }
      if (data["postfix"]) {
        postfix = data["postfix"]
      }
    } catch (e) {
      console.error("Could not parse arguments")
    }
  }

  const state = new OpeningHoursState(value, prefix, postfix)
  let expanded = new UIEventSource(false)
</script>

<Popup bodyPadding="p-0" shown={expanded}>
  <OHTable value={state.normalOhs} />
  <button
    on:click={() => expanded.set(false)}
    class="primary pointer-events-auto absolute left-0 bottom-0 h-8 w-10 rounded-full"
  >
    <Check class="m-0 h-6 w-6 shrink-0 p-0" color="white" />
  </button>
</Popup>
<button on:click={() => expanded.set(true)}>Pick opening hours</button>
<PublicHolidaySelector value={state.phSelectorValue} />
