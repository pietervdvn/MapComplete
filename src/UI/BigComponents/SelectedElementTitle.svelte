<script lang="ts">
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"

  export let state: SpecialVisualizationState
  export let layer: LayerConfig
  export let selectedElement: Feature
  let tags: UIEventSource<Record<string, string>> = state.featureProperties.getStore(
    selectedElement.properties.id
  )
  $: {
    tags = state.featureProperties.getStore(selectedElement.properties.id)
  }

  let isTesting = state.featureSwitchIsTesting
  let isDebugging = state.featureSwitches.featureSwitchIsDebugging

  let metatags: Store<Record<string, string>> = state.userRelatedState.preferencesAsTags
</script>

<div class="low-interaction flex border-b-2 border-black px-3 drop-shadow-md">
  <div class="h-fit w-full overflow-auto sm:p-2" style="max-height: 20vh;">
    {#if $tags._deleted === "yes"}
      <h3 class="p-4">
        <Tr t={Translations.t.delete.deletedTitle} />
      </h3>
    {:else}
      <div class="flex h-full w-full flex-grow flex-col">
        <!-- Title element and  title icons-->
        <h3 class="m-0">
          <a href={`#${$tags.id}`}>
            <TagRenderingAnswer config={layer.title} {selectedElement} {state} {tags} {layer} />
          </a>
        </h3>
        <div
          class="no-weblate title-icons links-as-button mr-2 flex flex-row flex-wrap items-center gap-x-0.5 pt-0.5 sm:pt-1"
        >
          {#each layer.titleIcons as titleIconConfig}
            {#if (titleIconConfig.condition?.matchesProperties($tags) ?? true) && (titleIconConfig.metacondition?.matchesProperties( { ...$metatags, ...$tags } ) ?? true) && titleIconConfig.IsKnown($tags)}
              <div class={titleIconConfig.renderIconClass ?? "flex h-8 w-8 items-center"}>
                <TagRenderingAnswer
                  config={titleIconConfig}
                  {tags}
                  {selectedElement}
                  {state}
                  {layer}
                  extraClasses="h-full justify-center"
                />
              </div>
            {/if}
          {/each}

          {#if $isTesting || $isDebugging}
            <a
              class="subtle"
              href="https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Layers/{layer.id}.md"
              target="_blank"
              rel="noreferrer noopener "
            >
              {layer.id}
            </a>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <slot name="close-button">
    <button
      class="mt-2 h-fit shrink-0 rounded-full border-none p-0"
      on:click={() => state.selectedElement.setData(undefined)}
      style="border: 0 !important; padding: 0 !important;"
      use:ariaLabel={Translations.t.general.backToMap}
    >
      <XCircleIcon aria-hidden={true} class="h-8 w-8" />
    </button>
  </slot>
</div>

<style>
  :global(.title-icons a) {
    display: block !important;
  }
</style>
