<script lang="ts">


  import NextButton from "./Base/NextButton.svelte";
  import { Utils } from "../Utils";
  import { UIEventSource } from "../Logic/UIEventSource";
  import Constants from "../Models/Constants";
  import ValidatedInput from "./InputElement/ValidatedInput.svelte";
  import EditLayerState from "./Studio/EditLayerState";
  import EditLayer from "./Studio/EditLayer.svelte";
  import Loading from "../assets/svg/Loading.svelte";


  export let studioUrl = "http://127.0.0.1:1235";
  let overview = UIEventSource.FromPromise<{ allFiles: string[] }>(Utils.downloadJson(studioUrl + "/overview"));
  let layers = overview.map(overview => {
    if (!overview) {
      return [];
    }
    return overview.allFiles.filter(f => f.startsWith("layers/")
    ).map(l => l.substring(l.lastIndexOf("/") + 1, l.length - ".json".length))
      .filter(layerId => Constants.priviliged_layers.indexOf(layerId) < 0);
  });
  let state: undefined | "edit_layer" | "new_layer" | "edit_theme" | "new_theme" | "editing_layer" | "loading" = undefined;

  let initialLayerConfig: undefined;
  let newLayerId = new UIEventSource<string>("");
  let layerIdFeedback = new UIEventSource<string>(undefined);
  newLayerId.addCallbackD(layerId => {
    if (layerId === "") {
      return;
    }
    if (layers.data.indexOf(layerId) >= 0) {
      layerIdFeedback.setData("This id is already used");
    }
  }, [layers]);


  let editLayerState = new EditLayerState();

</script>
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
    {#each $layers as layerId}
      <NextButton clss="small" on:click={async () => {
        console.log("Editing layer",layerId)
        state = "loading"
        initialLayerConfig = await Utils.downloadJson(studioUrl+"/layers/"+layerId+"/"+layerId+".json")
        state = "editing_layer"
       }}>
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
    <NextButton on:click={() => {initialLayerConfig = ({id: newLayerId.data}); state = "editing_layer"}}>
      Create this layer
    </NextButton>
  {/if}
{:else if state === "loading"}
  <Loading />
{:else if state === "editing_layer"}
  <EditLayer {initialLayerConfig} />
{/if}
