<script lang="ts">

  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte";
  import type { Feature } from "geojson";
  import { ImmutableStore } from "../../Logic/UIEventSource";
  import { GeoOperations } from "../../Logic/GeoOperations";
  import Center from "../../assets/svg/Center.svelte";
  import { Utils } from "../../Utils";

  export let feature: Feature;
  let properties: Record<string, string> = feature.properties;
  export let state: SpecialVisualizationState;
  let tags = state.featureProperties.getStore(properties.id) ?? new ImmutableStore(properties);

  const favLayer = state.layerState.filteredLayers.get("favourite");
  const favConfig = favLayer.layerDef;
  const titleConfig = favConfig.title;
  
  function center(){
    const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
    state.mapProperties.location.setData(
      {lon, lat}
    )
    state.guistate.menuIsOpened.setData(false)
  }
  
  function select(){
    state.selectedLayer.setData(favConfig)
    state.selectedElement.setData(feature)
    center()
  }
  
  const coord = GeoOperations.centerpointCoordinates(feature)
  const distance = state.mapProperties.location.stabilized(500).mapD(({lon, lat}) => {
    let meters = Math.round(GeoOperations.distanceBetween(coord, [lon, lat]))
    
    if(meters < 1000){
      return meters +"m"
    }
    
    meters = Math.round(meters / 100)
    const kmStr = ""+meters
    
    
    return kmStr.substring(0, kmStr.length - 1)+"."+kmStr.substring(kmStr.length-1) +"km"
  })
  const titleIconBlacklist = ["osmlink","sharelink","favourite_title_icon"]

</script>

<div class="px-1 my-1 border-2 border-dashed border-gray-300 rounded grid grid-cols-3 items-center no-weblate">
  <button on:click={() => select()} class="cursor-pointer ml-1 m-0 link justify-self-start">
    <TagRenderingAnswer extraClasses="underline" config={titleConfig} layer={favConfig} selectedElement={feature} {tags} />
  </button>

  {$distance}
  
  <div class="flex items-center justify-self-end title-icons links-as-button gap-x-0.5 p-1 pt-0.5 sm:pt-1">
    {#each favConfig.titleIcons as titleIconConfig}
      {#if (titleIconBlacklist.indexOf(titleIconConfig.id) < 0) && (titleIconConfig.condition?.matchesProperties(properties) ?? true) && (titleIconConfig.metacondition?.matchesProperties( { ...properties, ...state.userRelatedState.preferencesAsTags.data } ) ?? true) && titleIconConfig.IsKnown(properties)}
        <div class={titleIconConfig.renderIconClass ?? "flex h-8 w-8 items-center"}>
          <TagRenderingAnswer
            config={titleIconConfig}
            {tags}
            selectedElement={feature}
            {state}
            layer={favLayer}
            extraClasses="h-full justify-center"
          />
        </div>
      {/if}
    {/each}
    
    <button on:click={() => center()} class="p-1" ><Center class="w-6 h-6"/></button>
  </div>
</div>
