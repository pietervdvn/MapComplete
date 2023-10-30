<script lang="ts">
  /**
   * Opens the 'Opening hours input' in another top level window
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import OpeningHoursInput from "../../OpeningHours/OpeningHoursInput"

  export let value: UIEventSource<string>
</script>

<ToSvelte construct={new OpeningHoursInput(value)} />
