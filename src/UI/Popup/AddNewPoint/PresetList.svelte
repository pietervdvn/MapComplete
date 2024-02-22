<script lang="ts">
  import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
  import { createEventDispatcher } from "svelte"
  import type PresetConfig from "../../../Models/ThemeConfig/PresetConfig"
  import Tr from "../../Base/Tr.svelte"
  import Translations from "../../i18n/Translations.js"
  import { Translation } from "../../i18n/Translation"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import { ImmutableStore } from "../../../Logic/UIEventSource"
  import { TagUtils } from "../../../Logic/Tags/TagUtils"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import NextButton from "../../Base/NextButton.svelte"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import BaseUIElement from "../../BaseUIElement"
  import Combine from "../../Base/Combine"

  /**
   * This component lists all the presets and allows the user to select one
   */
  export let state: SpecialVisualizationState
  let layout: LayoutConfig = state.layout
  let presets: {
    preset: PresetConfig
    layer: LayerConfig
    text: Translation
    /**
     * Same as `this.preset.description.firstSentence()`
     */
    description: Translation
    icon: BaseUIElement
    tags: Record<string, string>
  }[] = []

  for (const layer of layout.layers) {
    const flayer = state.layerState.filteredLayers.get(layer.id)
    if (flayer.isDisplayed.data === false) {
      // The layer is not displayed...
      if (!state.featureSwitches.featureSwitchFilter.data) {
        console.log(
          "Not showing presets for layer",
          flayer.layerDef.id,
          "as not displayed and featureSwitchFilter.data is set",
          state.featureSwitches.featureSwitchFilter.data
        )
        // ...and we cannot enable the layer control -> we skip, as these presets can never be shown anyway
        continue
      }

      if (layer.name === undefined) {
        // this layer can never be toggled on in any case, so we skip the presets
        continue
      }
    }

    for (const preset of layer.presets) {
      const tags = TagUtils.KVtoProperties(preset.tags ?? [])

      const markers = layer.mapRendering.map((mr, i) =>
        mr
          .RenderIcon(new ImmutableStore<any>(tags), { noSize: i == 0 })
          .html.SetClass(i == 0 ? "w-full h-full" : "")
      )
      const icon: BaseUIElement = new Combine(
        markers.map((m) =>
          new Combine([m]).SetClass(
            "absolute top-0 left-0 w-full h-full flex justify-around items-center"
          )
        )
      ).SetClass("w-12 h-12 block relative mr-4")

      const description = preset.description?.FirstSentence()

      const simplified = {
        preset,
        layer,
        icon,
        description,
        tags,
        text: Translations.t.general.add.addNew.Subs(
          { category: preset.title },
          preset.title["context"]
        ),
      }
      presets.push(simplified)
    }
  }

  const dispatch = createEventDispatcher<{
    select: {
      preset: PresetConfig
      layer: LayerConfig
      icon: BaseUIElement
      tags: Record<string, string>
      text: Translation
    }
  }>()
</script>

<div class="flex w-full flex-col">
  <h2 class="mr-12">
    <!-- The title gets a big right margin to give place to the 'close'-button, see https://github.com/pietervdvn/MapComplete/issues/1445 -->
    <Tr t={Translations.t.general.add.intro} />
  </h2>

  {#each presets as preset}
    <NextButton on:click={() => dispatch("select", preset)}>
      <ToSvelte slot="image" construct={() => preset.icon} />
      <div class="flex flex-col">
        <b class="w-fit">
          <Tr t={preset.text} />
        </b>
        {#if preset.description}
          <Tr t={preset.description} cls="font-normal" />
        {/if}
      </div>
    </NextButton>
  {/each}
</div>
