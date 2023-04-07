<script lang="ts">
  import { Translation } from "../../i18n/Translation";
  import SpecialVisualizations from "../../SpecialVisualizations";
  import { onDestroy } from "svelte";
  import Locale from "../../i18n/Locale";
  import type { RenderingSpecification, SpecialVisualizationState } from "../../SpecialVisualization";
  import { Utils } from "../../../Utils.js";
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../../Logic/UIEventSource.js";
  import ToSvelte from "../../Base/ToSvelte.svelte";
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
  import WeblateLink from "../../Base/WeblateLink.svelte";
  import FromHtml from "../../Base/FromHtml.svelte";

  /**
   * The 'specialTranslation' renders a `Translation`-object, but interprets the special values as well
   */
  export let t: Translation;
  export let state: SpecialVisualizationState;
  export let tags: UIEventSource<Record<string, string>>;
  export let feature: Feature;
  export let layer: LayerConfig;

  let txt: string;
  $: onDestroy(Locale.language.addCallbackAndRunD(l => {
    txt = t.textFor(l);
  }));
  let specs: RenderingSpecification[] = [];
  $: {
    if (txt !== undefined) {
      specs = SpecialVisualizations.constructSpecification(txt);
    }
  }
</script>

{#each specs as specpart}
  {#if typeof specpart === "string"} 
    <span class="inline-flex items-center">
    <FromHtml src={Utils.SubstituteKeys(specpart, $tags)} />
    <WeblateLink context={t.context} />
    </span>
  {:else if $tags !== undefined }
    <ToSvelte construct={specpart.func.constr(state, tags, specpart.args, feature, layer)}></ToSvelte>
  {/if}
{/each}
