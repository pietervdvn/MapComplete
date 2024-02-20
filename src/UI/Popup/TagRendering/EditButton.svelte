<script lang="ts">
  import { PencilAltIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../../Utils/ariaLabel.js"
  import { Translation } from "../../i18n/Translation"

  /**
   * A small, round button with an edit-icon (and aria-labels etc)
   */
  /**
   * What arialabel to apply onto this button?
   */
  export let arialabel: Translation = undefined
  export let ariaLabelledBy: string = undefined
</script>

<button
  on:click
  class="secondary h-8 w-8 shrink-0 self-start rounded-full p-1"
  aria-labelledby={arialabel === undefined ? ariaLabelledBy : undefined}
  use:ariaLabel={arialabel}
>
  <PencilAltIcon />
</button>
