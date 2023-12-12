<script lang="ts">
  /**
   * Properly renders a translation
   */
  import { Translation } from "../i18n/Translation"
  import WeblateLink from "./WeblateLink.svelte"
  import { Store } from "../../Logic/UIEventSource"

  export let t: Translation
  export let cls: string = ""
  // Text for the current language
  let txt: Store<string | undefined> = t?.current


</script>

{#if txt}
  <span class={cls}>
    {$txt}
    <WeblateLink context={t.context} />
  </span>
{/if}
