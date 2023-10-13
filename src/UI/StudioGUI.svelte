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

  import layerSchemaRaw from "../../src/assets/schemas/layerconfigmeta.json";

  export let studioUrl = /*"https://studio.mapcomplete.org"; /*/ "http://127.0.0.1:1235"; //*/
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
    if (layers.data?.has(layerId)) {
      layerIdFeedback.setData("This id is already used");
    }
  }, [layers]);


  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw;

  let editLayerState = new EditLayerState(layerSchema, studio);

  function fetchIconDescription(layerId): any {
    return AllSharedLayers.getSharedLayersConfigs().get(layerId)?._layerIcon;
  }

  async function createNewLayer() {
    state = "loading";
    const id = newLayerId.data;
    const createdBy = osmConnection.userDetails.data.name;

    try {

      const loaded = await studio.fetchLayer(id);
      initialLayerConfig = loaded ?? {
        id, credits: createdBy,
        pointRendering: [
          {
            location: ["point", "centroid"],
            marker: [{
              icon: "circle",
              color: "white"
            }]
          }
        ],
        lineRendering : [{
          width : 1,
          color: "blue"
        }]
      };
    } catch (e) {
      initialLayerConfig = { id, credits: createdBy };
    }
    state = "editing_layer";
  }

  let osmConnection = new OsmConnection(new OsmConnection({
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    )
  }));

</script>

<LoginToggle state={{osmConnection}} ignoreLoading={true}>
  <div slot="not-logged-in">
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
    <div class="interactive flex m-2 rounded-2xl flex-col p-2">
      <h3>Enter the ID for the new layer</h3>
      A good ID is:
      <ul>
        <li>a noun</li>
        <li>singular</li>
        <li>describes the object</li>
        <li>in English</li>
      </ul>
      <div class="m-2 p-2 w-full">

        <ValidatedInput type="id" value={newLayerId} feedback={layerIdFeedback} on:submit={() => createNewLayer()} />
      </div>
      {#if $layerIdFeedback !== undefined}
        <div class="alert">
          {$layerIdFeedback}
        </div>
      {:else }
        <NextButton clss="primary" on:click={() => createNewLayer()}>
          Create layer {$newLayerId}
        </NextButton>
      {/if}
    </div>
  {:else if state === "loading"}
    <div class="w-8 h-8">
      <Loading />
    </div>
  {:else if state === "editing_layer"}
    <EditLayer {initialLayerConfig} state={editLayerState} />
  {/if}
</LoginToggle>
