<script lang="ts">
  import NextButton from "./Base/NextButton.svelte"
  import { Store, UIEventSource } from "../Logic/UIEventSource"
  import EditLayerState, { EditJsonState, EditThemeState } from "./Studio/EditLayerState"
  import EditLayer from "./Studio/EditLayer.svelte"
  import Loading from "../assets/svg/Loading.svelte"
  import StudioServer from "./Studio/StudioServer"
  import LoginToggle from "./Base/LoginToggle.svelte"
  import { OsmConnection } from "../Logic/Osm/OsmConnection"
  import { QueryParameters } from "../Logic/Web/QueryParameters"

  import layerSchemaRaw from "../../src/assets/schemas/layerconfigmeta.json"
  import layoutSchemaRaw from "../../src/assets/schemas/layoutconfigmeta.json"

  import If from "./Base/If.svelte"
  import BackButton from "./Base/BackButton.svelte"
  import ChooseLayerToEdit from "./Studio/ChooseLayerToEdit.svelte"
  import FloatOver from "./Base/FloatOver.svelte"
  import Walkthrough from "./Walkthrough/Walkthrough.svelte"
  import * as intro from "../assets/studio_introduction.json"
  import * as intro_tagrenderings from "../assets/studio_tagrenderings_intro.json"

  import { QuestionMarkCircleIcon } from "@babeard/svelte-heroicons/mini"
  import type { ConfigMeta } from "./Studio/configMeta"
  import EditTheme from "./Studio/EditTheme.svelte"
  import * as meta from "../../package.json"
  import Checkbox from "./Base/Checkbox.svelte"
  import { Utils } from "../Utils"
  import Translations from "./i18n/Translations"
  import Tr from "./Base/Tr.svelte"
  import Add from "../assets/svg/Add.svelte"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Hash from "../Logic/Web/Hash"

  export let studioUrl =
    window.location.hostname === "127.0.0.2"
      ? "http://127.0.0.1:1235"
      : "https://studio.mapcomplete.org"

  const oauth_token = QueryParameters.GetQueryParameter(
    "oauth_token",
    undefined,
    "Used to complete the login"
  )
  let osmConnection = new OsmConnection({
    oauth_token,
    checkOnlineRegularly: true
  })
  const expertMode = UIEventSource.asBoolean(
    osmConnection.GetPreference("studio-expert-mode", "false", {
      documentation: "Indicates if more options are shown in mapcomplete studio"
    })
  )
  expertMode.addCallbackAndRunD((expert) => console.log("Expert mode is", expert))
  const createdBy = osmConnection.userDetails.data.name
  const uid = osmConnection.userDetails.map((ud) => ud?.uid)
  const studio = new StudioServer(studioUrl, uid)

  let layersWithErr = studio.fetchOverview()
  let layerFilterTerm: string = ""
  let layers: Store<{ owner: number; id: string }[]> = layersWithErr.mapD((l) =>
    l["success"]?.filter((l) => l.category === "layers")
  )
  $: selfLayers = layers.mapD(
    (ls) =>
      ls.filter(
        (l) => l.owner === uid.data && l.id.toLowerCase().includes(layerFilterTerm.toLowerCase())
      ),
    [uid]
  )
  $: otherLayers = layers.mapD(
    (ls) =>
      ls.filter(
        (l) =>
          l.owner !== undefined &&
          l.owner !== uid.data &&
          l.id.toLowerCase().includes(layerFilterTerm.toLowerCase())
      ),
    [uid]
  )
  $: officialLayers = layers.mapD(
    (ls) =>
      ls.filter(
        (l) => l.owner === undefined && l.id.toLowerCase().includes(layerFilterTerm.toLowerCase())
      ),
    [uid]
  )

  let themeFilterTerm: string = ""

  let themes: Store<{ owner: number; id: string }[]> = layersWithErr.mapD((l) =>
    l["success"]?.filter((l) => l.category === "themes")
  )
  $: selfThemes = themes.mapD(
    (ls) =>
      ls.filter(
        (l) => l.owner === uid.data && l.id.toLowerCase().includes(themeFilterTerm.toLowerCase())
      ),
    [uid]
  )
  $: otherThemes = themes.mapD(
    (ls) =>
      ls.filter(
        (l) =>
          l.owner !== undefined &&
          l.owner !== uid.data &&
          l.id.toLowerCase().includes(themeFilterTerm.toLowerCase())
      ),
    [uid]
  )
  $: officialThemes = themes.mapD(
    (ls) =>
      ls.filter(
        (l) => l.owner === undefined && l.id.toLowerCase().includes(themeFilterTerm.toLowerCase())
      ),
    [uid]
  )

  let state:
    | undefined
    | "edit_layer"
    | "edit_theme"
    | "editing_layer"
    | "editing_theme"
    | "loading" = undefined

  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw
  let editLayerState = new EditLayerState(layerSchema, studio, osmConnection, { expertMode })
  let showIntro = editLayerState.showIntro

  const layoutSchema: ConfigMeta[] = <any>layoutSchemaRaw
  let editThemeState = new EditThemeState(layoutSchema, studio, { expertMode })

  const version = meta.version

  async function editLayer(event: { detail }): Promise<EditLayerState> {
    const layerId: { owner: number; id: string } = event["detail"]
    state = "loading"
    editLayerState.startSavingUpdates(false)
    editLayerState.configuration.setData(await studio.fetch(layerId.id, "layers", layerId.owner))
    editLayerState.startSavingUpdates()
    state = "editing_layer"
    return editLayerState
  }

  async function editTheme(event: { detail }): Promise<EditThemeState> {
    const id: { id: string; owner: number } = event["detail"]
    state = "loading"
    editThemeState.startSavingUpdates(false)
    const layout = await studio.fetch(id.id, "themes", id.owner)
    editThemeState.configuration.setData(layout)
    editThemeState.startSavingUpdates()
    state = "editing_theme"
    return editThemeState
  }

  async function createNewLayer() {
    state = "loading"
    const initialLayerConfig = {
      credits: createdBy,
      minzoom: 15,
      pointRendering: [
        {
          location: ["point", "centroid"],
          marker: [
            {
              icon: "circle",
              color: "white"
            }
          ]
        }
      ],
      tagRenderings: ["images"],
      lineRendering: [
        {
          width: 1,
          color: "blue"
        }
      ]
    }
    editLayerState.configuration.setData(initialLayerConfig)
    editLayerState.startSavingUpdates()
    state = "editing_layer"
  }

  async function selectStateBasedOnHash() {
    const hash = Hash.hash.data
    if (!hash) {
      return
    }
    console.log("Selecting state based on ", hash)
    const [mode, id, tab] = hash.split("/")
    // Not really an event, we just set the 'detail'
    const event = {
      detail: {
        id,
        owner: uid.data
      }
    }
    const statePromise: Promise<EditJsonState<any>> = mode === "layer" ? editLayer(event) : editTheme(event)
    const state = await statePromise
    state.selectedTab.setData(Number(tab))
  }

  selectStateBasedOnHash()

  function backToStudio() {
    console.log("Back to studio")
    state = undefined
    Hash.hash.setData(undefined)
  }
</script>

<If condition={layersWithErr.map((d) => d?.["error"] !== undefined)}>
  <div>
    <div class="alert">
      Something went wrong while contacting the MapComplete Studio Server: {$layersWithErr["error"]}
    </div>
    The server might be offline. Please:
    <ul>
      <li>Try again in a few minutes</li>
      <li>
        Contact <a href="https://app.element.io/#/room/#MapComplete:matrix.org">
        the MapComplete community via the chat.
      </a>
        Someone might be able to help you
      </li>
      <li>
        File <a href="https://github.com/pietervdvn/MapComplete/issues">an issue</a>
      </li>
      <li>
        Contact the devs via <a href="mailto:info@posteo.net">email</a>
      </li>
    </ul>
  </div>
  <LoginToggle ignoreLoading={true} slot="else" state={{ osmConnection }}>
    <div slot="not-logged-in">
      <NextButton clss="primary" on:click={() => osmConnection.AttemptLogin()}>
        Please log in to use MapComplete Studio
      </NextButton>
    </div>
    {#if state === undefined}
      <div class="flex h-full flex-col justify-between p-4">
        <div class="flex w-full flex-col">
          <h1>MapComplete Studio</h1>

          <NextButton on:click={() => (state = "edit_layer")}>
            <div class="flex flex-col items-start">
              <div>Edit an existing layer</div>
              <div class="font-normal">
                Edit layers you created, others created or from the official MapComplete
              </div>
            </div>
          </NextButton>
          <NextButton on:click={() => createNewLayer()}>Create a new layer</NextButton>
          <NextButton on:click={() => (state = "edit_theme")}>Edit a theme</NextButton>
          <NextButton
            on:click={() => {
              editThemeState.configuration.setData({})
              editThemeState.startSavingUpdates()
              state = "editing_theme"
            }}
          >
            Create a new theme
          </NextButton>
          <button
            class="small"
            on:click={() => {
              showIntro.setData("intro")
            }}
          >
            <QuestionMarkCircleIcon class="h-6 w-6" />
            Show the introduction again
          </button>
          <a class="button flex" href={Utils.HomepageLink()}>
            <Add class="h-6 w-6" />
            <Tr t={Translations.t.general.backToIndex} />
          </a>
        </div>
        <div>
          <Checkbox selected={expertMode}>Enable more options (expert mode)</Checkbox>
          <span class="subtle">MapComplete version {version}</span>
        </div>
      </div>
    {:else if state === "edit_layer"}
      <div class="m-4 flex flex-col">
        <BackButton
          clss="small p-1"
          imageClass="w-8 h-8"
          on:click={() => backToStudio()}
        >
          MapComplete Studio
        </BackButton>
        <h2>Choose a layer to edit</h2>

        <form class="flex justify-center">
          <label
            class="neutral-label my-2 flex w-full items-center rounded-full border-2 border-black sm:w-1/2"
          >
            <SearchIcon aria-hidden="true" class="h-8 w-8" />
            <input
              class="mr-4 w-full outline-none"
              id="layer-search"
              type="search"
              placeholder="Filter layers by name"
              bind:value={layerFilterTerm}
            />
          </label>
        </form>

        <ChooseLayerToEdit {osmConnection} layerIds={$selfLayers} on:layerSelected={editLayer}>
          <h3 slot="title">Your layers</h3>
        </ChooseLayerToEdit>
        <h3>Layers by other contributors</h3>
        <div>
          Selecting a layer will create a copy in your account that you edit. You will not change
          the version of the other contributor
        </div>
        <ChooseLayerToEdit {osmConnection} layerIds={$otherLayers} on:layerSelected={editLayer} />

        <h3>Official layers by MapComplete</h3>
        <div>
          Selecting a layer will create a copy in your account. You will not change the version that
          is in MapComplete
        </div>
        <ChooseLayerToEdit
          {osmConnection}
          layerIds={$officialLayers}
          on:layerSelected={editLayer}
        />
      </div>
    {:else if state === "edit_theme"}
      <div class="m-4 flex flex-col">
        <BackButton
          clss="small p-1"
          imageClass="w-8 h-8"
          on:click={() => backToStudio()}
        >
          MapComplete Studio
        </BackButton>
        <h2>Choose a theme to edit</h2>

        <form class="flex justify-center">
          <label
            class="neutral-label my-2 flex w-full items-center rounded-full border-2 border-black sm:w-1/2"
          >
            <SearchIcon aria-hidden="true" class="h-8 w-8" />
            <input
              class="mr-4 w-full outline-none"
              id="theme-search"
              type="search"
              placeholder="Filter themes by name"
              bind:value={themeFilterTerm}
            />
          </label>
        </form>

        <ChooseLayerToEdit {osmConnection} layerIds={$selfThemes} on:layerSelected={editTheme}>
          <h3 slot="title">Your themes</h3>
        </ChooseLayerToEdit>
        <h3>Themes by other contributors</h3>
        <ChooseLayerToEdit {osmConnection} layerIds={$otherThemes} on:layerSelected={editTheme} />
        <h3>Official themes by MapComplete</h3>
        <ChooseLayerToEdit
          {osmConnection}
          layerIds={$officialThemes}
          on:layerSelected={editTheme}
        />
      </div>
    {:else if state === "loading"}
      <div class="h-8 w-8">
        <Loading />
      </div>
    {:else if state === "editing_layer"}
      <EditLayer
        state={editLayerState}
        {backToStudio}
      >
        <BackButton
          clss="small p-1"
          imageClass="w-8 h-8"
          on:click={() => backToStudio()}
        >
          MapComplete Studio
        </BackButton>
      </EditLayer>
    {:else if state === "editing_theme"}
      <EditTheme state={editThemeState} selfLayers={$selfLayers} otherLayers={$otherLayers} {osmConnection}
                 {backToStudio}>
        <BackButton
          clss="small p-1"
          imageClass="w-8 h-8"
          on:click={() => backToStudio()}
        >
          MapComplete Studio
        </BackButton>
      </EditTheme>
    {/if}

    {#if { intro, tagrenderings: intro_tagrenderings }[$showIntro]?.sections}
      <FloatOver
        on:close={() => {
          showIntro.setData("no")
        }}
      >
        <div class="flex h-full p-4 pr-12">
          <Walkthrough
            pages={{ intro, tagrenderings: intro_tagrenderings }[$showIntro]?.sections}
            on:done={() => {
              showIntro.setData("no")
            }}
          />
        </div>
      </FloatOver>
    {/if}
  </LoginToggle>
</If>
