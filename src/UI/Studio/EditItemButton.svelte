<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Marker from "../Map/Marker.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import { AllKnownLayouts } from "../../Customizations/AllKnownLayouts"
  import { AllSharedLayers } from "../../Customizations/AllSharedLayers"
  import { createEventDispatcher } from "svelte"

  export let info: { id: string; owner: number }
  export let category: "layers" | "themes"
  export let osmConnection: OsmConnection
  const dispatch = createEventDispatcher<{ layerSelected: string }>()

  let displayName = UIEventSource.FromPromise(
    osmConnection.getInformationAboutUser(info.owner)
  ).mapD((response) => response.display_name)
  let selfId = osmConnection.userDetails.mapD((ud) => ud.uid)

  function fetchIconDescription(layerId): any {
    if (category === "themes") {
      return AllKnownLayouts.allKnownLayouts.get(layerId).icon
    }
    return AllSharedLayers.getSharedLayersConfigs().get(layerId)?._layerIcon
  }
</script>

<NextButton clss="small" on:click={() => dispatch("layerSelected", info)}>
  <div class="mr-1 h-4 w-4">
    <Marker icons={fetchIconDescription(info.id)} />
  </div>
  <b class="px-1">{info.id}</b>
  {#if info.owner && info.owner !== $selfId}
    {#if $displayName}
      (made by {$displayName}
      {#if window.location.host.startsWith("127.0.0.1")}
        - {info.owner}
      {/if}
      )
    {:else}
      ({info.owner})
    {/if}
  {/if}
</NextButton>
