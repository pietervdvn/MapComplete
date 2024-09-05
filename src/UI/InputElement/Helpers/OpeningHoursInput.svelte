<script lang="ts">
  /**
   * Opens the 'Opening hours input' in another top level window
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import OpeningHoursInput from "../../OpeningHours/OpeningHoursInput"
  import PublicHolidaySelector from "../../OpeningHours/PublicHolidaySelector.svelte"

  export let value: UIEventSource<string>
  export let phSelectorValue = new UIEventSource("")
</script>

<ToSvelte construct={new OpeningHoursInput(value, phSelectorValue)} />
<PublicHolidaySelector value={phSelectorValue}/>
