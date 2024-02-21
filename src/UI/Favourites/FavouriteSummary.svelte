<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { GeoOperations } from "../../Logic/GeoOperations"

  export let feature: Feature
  let properties: Record<string, string> = feature.properties
  export let state: SpecialVisualizationState
  let tags =
    state.featureProperties.getStore(properties.id) ??
    new UIEventSource<Record<string, string>>(properties)

  const favLayer = state.layerState.filteredLayers.get("favourite")
  const favConfig = favLayer?.layerDef
  const titleConfig = favConfig?.title

  function center() {
    const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
    state.mapProperties.location.setData({ lon, lat })
    const z = state.mapProperties.zoom.data
    state.mapProperties.zoom.setData(Math.min(17, Math.max(12, z)))
    state.guistate.menuIsOpened.setData(false)
  }

  function select() {
    state.selectedElement.setData(feature)
    center()
  }

  let titleIconBlacklist = ["osmlink", "sharelink", "favourite_title_icon"]
</script>

{#if favLayer !== undefined}
  <div
    class="no-weblate my-1 flex grid-cols-2 flex-wrap items-center justify-between rounded border-2 border-dashed border-gray-300 px-1"
  >
    <button class="link m-0 ml-1 cursor-pointer justify-self-start" on:click={() => select()}>
      <TagRenderingAnswer
        {state}
        config={titleConfig}
        extraClasses="underline"
        layer={favConfig}
        selectedElement={feature}
        {tags}
      />
    </button>

    <div
      class="title-icons links-as-button flex flex-wrap items-center gap-x-0.5 self-end justify-self-end p-1 pt-0.5 sm:pt-1"
    >
      {#each favConfig.titleIcons as titleIconConfig}
        {#if titleIconBlacklist.indexOf(titleIconConfig.id) < 0 && (titleIconConfig.condition?.matchesProperties(properties) ?? true) && (titleIconConfig.metacondition?.matchesProperties( { ...properties, ...state.userRelatedState.preferencesAsTags.data } ) ?? true) && titleIconConfig.IsKnown(properties)}
          <div class={titleIconConfig.renderIconClass ?? "flex h-8 w-8 items-center"}>
            <TagRenderingAnswer
              config={titleIconConfig}
              {tags}
              selectedElement={feature}
              {state}
              layer={favLayer.layerDef}
              extraClasses="h-full justify-center"
            />
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}
