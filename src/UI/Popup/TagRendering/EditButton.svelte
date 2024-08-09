<script lang="ts">
  import { ariaLabel } from "../../../Utils/ariaLabel.js"
  import { Translation } from "../../i18n/Translation"
  import Pencil from "@babeard/svelte-heroicons/solid/Pencil"

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
  class="as-link edit-button h-8 w-8 shrink-0 self-start rounded-full p-1"
  aria-labelledby={arialabel === undefined ? ariaLabelledBy : undefined}
  use:ariaLabel={arialabel}
>
  <Pencil class="hover-alert h-4 w-4" />
</button>
