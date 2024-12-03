<script lang="ts">
  import { UIEventSource } from "../Logic/UIEventSource"
  import { QueryParameters } from "../Logic/Web/QueryParameters"
  import ValidatedInput from "./InputElement/ValidatedInput.svelte"
  import { Overpass } from "../Logic/Osm/Overpass"
  import Constants from "../Models/Constants"
  import MaplibreMap from "./Map/MaplibreMap.svelte"
  import { MapLibreAdaptor } from "./Map/MapLibreAdaptor"
  import { Map as MlMap } from "maplibre-gl"
  import ShowDataLayer from "./Map/ShowDataLayer"
  import * as inspector_theme from "../assets/generated/themes/inspector.json"

  import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource"
  import type { Feature } from "geojson"
  import Loading from "./Base/Loading.svelte"
  import { linear } from "svelte/easing"
  import { Drawer } from "flowbite-svelte"
  import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
  import History from "./History/History.svelte"
  import TitledPanel from "./Base/TitledPanel.svelte"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"
  import { Utils } from "../Utils"
  import AggregateView from "./History/AggregateView.svelte"
  import { HistoryUtils } from "./History/HistoryUtils"
  import AggregateImages from "./History/AggregateImages.svelte"
  import Page from "./Base/Page.svelte"
  import PreviouslySpiedUsers from "./History/PreviouslySpiedUsers.svelte"
  import { OsmConnection } from "../Logic/Osm/OsmConnection"

  let username = QueryParameters.GetQueryParameter("user", undefined, "Inspect this user")
  let step = new UIEventSource<"waiting" | "loading" | "done">("waiting")
  let map = new UIEventSource<MlMap>(undefined)
  let zoom = UIEventSource.asFloat(QueryParameters.GetQueryParameter("z", "0"))
  let lat = UIEventSource.asFloat(QueryParameters.GetQueryParameter("lat", "0"))
  let lon = UIEventSource.asFloat(QueryParameters.GetQueryParameter("lon", "0"))
  let theme = new ThemeConfig(<any>inspector_theme, true)
  let layer = theme.layers.find(l => l.id === "usertouched")
  // Is this a dirty hack? Yes it is!
  theme.getMatchingLayer = () => {
    return layer
  }
  let loadingData = false
  let selectedElement = new UIEventSource<Feature>(undefined)

  let maplibremap: MapLibreAdaptor = new MapLibreAdaptor(map, {
    zoom,
    location: new UIEventSource<{ lon: number; lat: number }>({ lat: lat.data, lon: lon.data })
  })
  maplibremap.location.stabilized(500).addCallbackAndRunD(l => {
    lat.set(l.lat)
    lon.set(l.lon)
  })


  let featuresStore = new UIEventSource<Feature[]>([])
  let features = new StaticFeatureSource(featuresStore)
  ShowDataLayer.showMultipleLayers(map, features, HistoryUtils.personalTheme.layers, {
    zoomToFeatures: true,
    onClick: (f: Feature) => {
      selectedElement.set(undefined)
      Utils.waitFor(200).then(() => {
        selectedElement.set(f)
      })
    }
  })

  let osmConnection = new OsmConnection()
  let inspectedContributors: UIEventSource<{
    name: string,
    visitedTime: string,
    label: string
  }[]> = UIEventSource.asObject(
    osmConnection.getPreference("spied-upon-users"), [])

  async function load() {
    const user = username.data
    {

      const inspectedData = inspectedContributors.data
      const previousEntry = inspectedData.find(e => e.name === user)
      if (previousEntry) {
        previousEntry.visitedTime = new Date().toISOString()
      } else {
        inspectedData.push({
          label: undefined,
          visitedTime: new Date().toISOString(),
          name: user
        })
      }
      inspectedContributors.ping()
    }

    step.setData("loading")
    featuresStore.set([])
    const overpass = new Overpass(undefined, ["nw(user_touched:\"" + user + "\");"], Constants.defaultOverpassUrls[0])
    if (!maplibremap.bounds.data) {
      return
    }
    loadingData = true
    const [data, date] = await overpass.queryGeoJson(maplibremap.bounds.data)
    console.log("Overpass result:", data)
    loadingData = false
    console.log(data, date)
    featuresStore.set(data.features)
    console.log("Loaded", data.features.length)
  }

  map.addCallbackAndRunD(() => {
    // when the map is loaded: attempt to load the user given via Queryparams
    if (username.data) {
      console.log("Current username is", username.data)
      load()
    }
    return true
  })

  let mode: "map" | "table" | "aggregate" | "images" = "map"

  let showPreviouslyVisited = new UIEventSource(true)

</script>

<div class="flex flex-col w-full h-full">

  <div class="flex gap-x-2 items-center low-interaction p-2">
    <h1 class="flex-shrink-0">Inspect contributor</h1>
    <ValidatedInput type="string" value={username} on:submit={() => load()} />
    {#if loadingData}
      <Loading />
    {:else}
      <button class="primary" on:click={() => load()}>Load</button>
    {/if}
    <button on:click={() => showPreviouslyVisited.setData(true)}>
      Show earlier inspected contributors
    </button>
    <a href="./index.html" class="button">Back to index</a>
  </div>

  <div class="flex">
    <button class:primary={mode === "map"} on:click={() => mode = "map"}>
      Map view
    </button>
    <button class:primary={mode === "table"} on:click={() => mode = "table"}>
      Table view
    </button>
    <button class:primary={mode === "aggregate"} on:click={() => mode = "aggregate"}>
      Aggregate
    </button>
    <button class:primary={mode === "images"} on:click={() => mode = "images"}>
      Images
    </button>
  </div>

  {#if mode === "map"}
    {#if $selectedElement !== undefined}
      <!-- right modal with the selected element view -->
      <Drawer
        placement="right"
        transitionType="fly"
        activateClickOutside={false}
        backdrop={false}
        id="drawer-right"
        width="w-full md:w-6/12 lg:w-5/12 xl:w-4/12"
        rightOffset="inset-y-0 right-0"
        transitionParams={{
        x: 640,
        duration: 0,
        easing: linear,
      }}
        divClass="overflow-y-auto z-50 bg-white"
        hidden={$selectedElement === undefined}
        on:close={() => {
        selectedElement.setData(undefined)
      }}
      >

        <TitledPanel>
          <div slot="title" class="flex justify-between">

            <a target="_blank" rel="noopener"
               href={"https://osm.org/"+$selectedElement.properties.id}>{$selectedElement.properties.id}</a>
            <XCircleIcon class="w-6 h-6" on:click={() => selectedElement.set(undefined)} />
          </div>

          <History onlyShowChangesBy={$username} id={$selectedElement.properties.id}></History>
        </TitledPanel>
      </Drawer>
    {/if}

    <div class="flex-grow overflow-hidden m-1 rounded-xl">
      <MaplibreMap map={map} mapProperties={maplibremap} autorecovery={true} />
    </div>
  {:else if mode === "table"}
    <div class="m-2 h-full overflow-y-auto">
      {#each $featuresStore as f}
        <History onlyShowChangesBy={$username} id={f.properties.id} />
      {/each}
    </div>
  {:else if mode === "aggregate"}
    <div class="m-2 h-full overflow-y-auto">
      <AggregateView features={$featuresStore} onlyShowUsername={$username} />
    </div>
  {:else if mode === "images"}
    <div class="m-2 h-full overflow-y-auto">
      <AggregateImages features={$featuresStore} onlyShowUsername={$username} />
    </div>
  {/if}
</div>

<Page shown={showPreviouslyVisited}>
  <div slot="header">Earlier inspected constributors</div>
  <PreviouslySpiedUsers {osmConnection} {inspectedContributors} on:selectUser={(e) => {
    username.set(e.detail); load();showPreviouslyVisited.set(false)
  }}  />
</Page>
