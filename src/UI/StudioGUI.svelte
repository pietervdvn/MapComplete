<script lang="ts">


  import NextButton from "./Base/NextButton.svelte";
  import { Store, UIEventSource } from "../Logic/UIEventSource";
  import EditLayerState from "./Studio/EditLayerState";
  import EditLayer from "./Studio/EditLayer.svelte";
  import Loading from "../assets/svg/Loading.svelte";
  import StudioServer from "./Studio/StudioServer";
  import LoginToggle from "./Base/LoginToggle.svelte";
  import { OsmConnection } from "../Logic/Osm/OsmConnection";
  import { QueryParameters } from "../Logic/Web/QueryParameters";

  import layerSchemaRaw from "../../src/assets/schemas/layerconfigmeta.json";
  import If from "./Base/If.svelte";
  import BackButton from "./Base/BackButton.svelte";
  import ChooseLayerToEdit from "./Studio/ChooseLayerToEdit.svelte";
  import { LocalStorageSource } from "../Logic/Web/LocalStorageSource";
  import FloatOver from "./Base/FloatOver.svelte";
  import Walkthrough from "./Walkthrough/Walkthrough.svelte";
  import * as intro from "../assets/studio_introduction.json";
  import { QuestionMarkCircleIcon } from "@babeard/svelte-heroicons/mini";
  import type { ConfigMeta } from "./Studio/configMeta";

  export let studioUrl = window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:1235" : "https://studio.mapcomplete.org";

  let osmConnection = new OsmConnection(new OsmConnection({
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    )
  }));
  const createdBy = osmConnection.userDetails.data.name;
  const uid = osmConnection.userDetails.map(ud => ud?.uid);
  const studio = new StudioServer(studioUrl, uid);

  let layersWithErr = uid.bind(uid => UIEventSource.FromPromiseWithErr(studio.fetchLayerOverview()));
  let layers: Store<{ owner: number }[]> = layersWithErr.mapD(l => l.success);
  let selfLayers = layers.mapD(ls => ls.filter(l => l.owner === uid.data), [uid]);
  let otherLayers = layers.mapD(ls => ls.filter(l => l.owner !== uid.data), [uid]);

  let state: undefined | "edit_layer" | "edit_theme" | "new_theme" | "editing_layer" | "loading" = undefined;

  let initialLayerConfig: { id: string };

  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw;

  let editLayerState = new EditLayerState(layerSchema, studio, osmConnection);
  let layerId = editLayerState.configuration.map(layerConfig => layerConfig.id);

  let showIntro = UIEventSource.asBoolean(LocalStorageSource.Get("studio-show-intro", "true"));

  async function editLayer(event: Event) {
    const layerId = event.detail;
    state = "loading";
    initialLayerConfig = await studio.fetchLayer(layerId);
    state = "editing_layer";
  }

  async function createNewLayer() {
    state = "loading";
    initialLayerConfig = {
      credits: createdBy,
      minzoom: 15,
      pointRendering: [
        {
          location: ["point", "centroid"],
          marker: [{
            icon: "circle",
            color: "white"
          }]
        }
      ],
      lineRendering: [{
        width: 1,
        color: "blue"
      }]
    };
    state = "editing_layer";
  }


</script>

<If condition={layersWithErr.map(d => d?.error !== undefined)}>
  <div>
    <div class="alert">
      Something went wrong while contacting the MapComplete Studio Server: {$layersWithErr["error"]}
    </div>
    The server might be offline. Please:
    <ul>

      <li>
        Try again in a few minutes
      </li>
      <li>
        Contact <a href="https://app.element.io/#/room/#MapComplete:matrix.org">the MapComplete community via the
        chat.</a> Someone might be able to help you
      </li>
      <li>
        File <a href="https://github.com/pietervdvn/MapComplete/issues">an issue</a>
      </li>
      <li>
        Contact the devs via <a href="mailto:info@posteo.net">email</a>
      </li>
    </ul>
  </div>
  <LoginToggle ignoreLoading={true} slot="else" state={{osmConnection}}>
    <div slot="not-logged-in">
      <NextButton clss="primary" on:click={() => osmConnection.AttemptLogin()}>
        Please log in to use MapComplete Studio
      </NextButton>
    </div>
    {#if state === undefined}
      <div class="m-4">
        <h1>MapComplete Studio</h1>
        <div class="w-full flex flex-col">

          <NextButton on:click={() => state = "edit_layer"}>
            Edit an existing layer
          </NextButton>
          <NextButton on:click={() => createNewLayer()}>
            Create a new layer
          </NextButton>
          <!--
          <NextButton on:click={() => state = "edit_theme"}>
            Edit a theme
          </NextButton>
          <NextButton on:click={() => state = "new_theme"}>
            Create a new theme
          </NextButton>
          -->
          <NextButton clss="small" on:click={() => {showIntro.setData(true)} }>
            <QuestionMarkCircleIcon class="w-6 h-6" />
            Show the introduction again
          </NextButton>
        </div>
      </div>
    {:else if state === "edit_layer"}

      <div class="flex flex-col m-4">
        <BackButton clss="small p-1" imageClass="w-8 h-8" on:click={() => {state =undefined}}>MapComplete Studio
        </BackButton>
        <h2>Choose a layer to edit</h2>
        <ChooseLayerToEdit layerIds={$selfLayers} on:layerSelected={editLayer}>
          <h3 slot="title">Your layers</h3>
        </ChooseLayerToEdit>
        <h3>Official layers</h3>
        <ChooseLayerToEdit layerIds={$otherLayers} on:layerSelected={editLayer} />
      </div>
    {:else if state === "loading"}
      <div class="w-8 h-8">
        <Loading />
      </div>
    {:else if state === "editing_layer"}
      <EditLayer {initialLayerConfig} state={editLayerState}>
        <BackButton clss="small p-1" imageClass="w-8 h-8" on:click={() => {state =undefined}}>MapComplete Studio
        </BackButton>
      </EditLayer>
    {/if}
  </LoginToggle>
</If>


{#if $showIntro}
  <FloatOver>
    <div class="flex p-4 h-full">
      <Walkthrough pages={intro.sections} on:done={() => {showIntro.setData(false)}} />
    </div>
  </FloatOver>

{/if}
