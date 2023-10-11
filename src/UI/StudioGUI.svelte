<script lang="ts">


  import NextButton from "./Base/NextButton.svelte";
  import { UIEventSource } from "../Logic/UIEventSource";
  import ValidatedInput from "./InputElement/ValidatedInput.svelte";
  import EditLayerState from "./Studio/EditLayerState";
  import EditLayer from "./Studio/EditLayer.svelte";
  import Loading from "../assets/svg/Loading.svelte";
  import Marker from "./Map/Marker.svelte";
  import { AllSharedLayers } from "../Customizations/AllSharedLayers";
  import StudioServer from "./Studio/StudioServer";
  import LoginToggle from "./Base/LoginToggle.svelte";
  import { OsmConnection } from "../Logic/Osm/OsmConnection";
  import { QueryParameters } from "../Logic/Web/QueryParameters";


  export let studioUrl = "http://127.0.0.1:1235";
  const studio = new StudioServer(studioUrl);
  let layers = UIEventSource.FromPromise(studio.fetchLayerOverview());
  let state: undefined | "edit_layer" | "new_layer" | "edit_theme" | "new_theme" | "editing_layer" | "loading" = undefined;

  let initialLayerConfig: { id: string };
  let newLayerId = new UIEventSource<string>("");
  let layerIdFeedback = new UIEventSource<string>(undefined);
  newLayerId.addCallbackD(layerId => {
    if (layerId === "") {
      return;
    }
    if (layers.data.has(layerId)) {
      layerIdFeedback.setData("This id is already used");
    }
  }, [layers]);


  let editLayerState = new EditLayerState();

  function fetchIconDescription(layerId): any {
    const icon = AllSharedLayers.getSharedLayersConfigs().get(layerId)?._layerIcon;
    console.log(icon);
    return icon;
  }
  
  let osmConnection = new OsmConnection( new OsmConnection({
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    ),
  }))

</script>

<LoginToggle state={{osmConnection}}>
   <div slot="not-logged-in" >
     <NextButton clss="primary">
       Please log in to use MapComplete Studio
     </NextButton>
   </div>
{#if state === undefined}
  <h1>MapComplete Studio</h1>
  <div class="w-full flex flex-col">

    <NextButton on:click={() => state = "edit_layer"}>
      Edit an existing layer
    </NextButton>
    <NextButton on:click={() => state = "new_layer"}>
      Create a new layer
    </NextButton>
    <NextButton on:click={() => state = "edit_theme"}>
      Edit a theme
    </NextButton>
    <NextButton on:click={() => state = "new_theme"}>
      Create a new theme
    </NextButton>
  </div>
{:else if state === "edit_layer"}
  <div class="flex flex-wrap">
    {#each Array.from($layers) as layerId}
      <NextButton clss="small" on:click={async () => {
        console.log("Editing layer",layerId)
        state = "loading"
        initialLayerConfig = await studio.fetchLayer(layerId)
        state = "editing_layer"
       }}>
        <div class="w-4 h-4 mr-1">
          <Marker icons={fetchIconDescription(layerId)} />
        </div>
        {layerId}
      </NextButton>
    {/each}
  </div>
{:else if state === "new_layer"}
  <ValidatedInput type="id" value={newLayerId} feedback={layerIdFeedback} />
  {#if $layerIdFeedback !== undefined}
    <div class="alert">
      {$layerIdFeedback}
    </div>
  {:else }
    <NextButton on:click={async () => {
      state = "loading"
      const id = newLayerId.data
        const createdBy = osmConnection.userDetails.data.name
      
      const loaded = await studio.fetchLayer(id, true)
      initialLayerConfig = loaded ?? {id, credits: createdBy};
      state = "editing_layer"}}>
      Create this layer
    </NextButton>
  {/if}
{:else if state === "loading"}
  <div class="w-8 h-8">
    <Loading />
  </div>
{:else if state === "editing_layer"}
  <EditLayer {initialLayerConfig} />
{/if}
</LoginToggle>
