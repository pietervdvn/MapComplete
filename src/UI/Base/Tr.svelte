<script lang="ts">
  /**
   * Properly renders a translation
   */
  import { Translation } from "../i18n/Translation"
  import WeblateLink from "./WeblateLink.svelte"
  import { Store } from "../../Logic/UIEventSource"
  import FromHtml from "./FromHtml.svelte"
  import { Utils } from "../../Utils"

  export let t: Translation
  export let cls: string = ""
  // Text for the current language
  let txt: Store<string | undefined> = t?.current
  let lang = t?.currentLang
  $: {
    txt = t?.current
    lang = t?.currentLang
  }
</script>

{#if $txt}
  {#if cls}
  <span class={cls}>
    <span lang={$lang}>
      {@html Utils.purify($txt)}
    </span>
    <WeblateLink context={t?.context} />
  </span>
  {:else}
     <span lang={$lang}>
      {@html Utils.purify($txt)}
    </span>
    <WeblateLink context={t?.context} />
  {/if}
{/if}
