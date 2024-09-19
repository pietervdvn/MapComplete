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
  import CheckCircle from "@babeard/svelte-heroicons/mini/CheckCircle"
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

  const state = new OpeningHoursState(value)
  let expanded = new UIEventSource(false)
</script>
<Popup bodyPadding="p-0" shown={expanded}>
  <OHTable value={state.normalOhs} />
    <button on:click={() => expanded.set(false)} class="absolute left-0 bottom-0 primary pointer-events-auto h-8 w-10 rounded-full">
      <Check class="shrink-0 w-6 h-6 m-0 p-0" color="white"/>
    </button>
</Popup>
<button on:click={() => expanded.set(true)}>Pick opening hours</button>
<PublicHolidaySelector value={state.phSelectorValue} />
