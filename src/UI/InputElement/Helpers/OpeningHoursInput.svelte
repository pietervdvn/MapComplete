<script lang="ts">
  /**
   * Opens the 'Opening hours input' in another top level window
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import OpeningHoursInput from "../../OpeningHours/OpeningHoursState"
  import PublicHolidaySelector from "../../OpeningHours/PublicHolidaySelector.svelte"
  import OHTable from "./OpeningHours/OHTable.svelte"
  import OpeningHoursState from "../../OpeningHours/OpeningHoursState"
  import Popup from "../../Base/Popup.svelte"

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

  const state = new OpeningHoursState(value)
  let expanded = new UIEventSource(false)
</script>
<Popup bodyPadding="p-0" shown={expanded}>
  <OHTable value={state.normalOhs} />
  <div class="absolute w-full pointer-events-none bottom-0 flex justify-end">
    <button on:click={() => expanded.set(false)} class="primary pointer-events-auto">Done</button>
  </div>
</Popup>
<button on:click={() => expanded.set(true)}>Pick opening hours</button>
<PublicHolidaySelector value={state.phSelectorValue} />
