<script lang="ts">
  /**
   * Properly renders a translation
   */
  import { Translation } from "../i18n/Translation";
  import { onDestroy } from "svelte";
  import Locale from "../i18n/Locale";
  import { Utils } from "../../Utils";
  import FromHtml from "./FromHtml.svelte";
  import WeblateLink from "./WeblateLink.svelte";

  export let t: Translation;
  export let cls: string = ""
  export let tags: Record<string, string> | undefined = undefined;
  // Text for the current language
  let txt: string | undefined;

  $: onDestroy(Locale.language.addCallbackAndRunD(l => {
    const translation = t?.textFor(l);
    if (translation === undefined) {
      return;
    }
    if (tags) {
      txt = Utils.SubstituteKeys(txt, tags);
    } else {
      txt = translation;
    }
  }));

</script>

{#if t}
  <span class={"inline-flex items-center "+cls}>
  <FromHtml src={txt}></FromHtml>
  <WeblateLink context={t.context}></WeblateLink>
  </span>
{/if}
