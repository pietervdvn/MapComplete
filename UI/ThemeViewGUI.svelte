<script lang="ts">
  import { Store, UIEventSource } from "../Logic/UIEventSource";
  import { Map as MlMap } from "maplibre-gl";
  import MaplibreMap from "./Map/MaplibreMap.svelte";
  import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
  import FeatureSwitchState from "../Logic/State/FeatureSwitchState";
  import MapControlButton from "./Base/MapControlButton.svelte";
  import ToSvelte from "./Base/ToSvelte.svelte";
  import Svg from "../Svg";
  import If from "./Base/If.svelte";
  import { GeolocationControl } from "./BigComponents/GeolocationControl.js";
  import type { Feature } from "geojson";
  import SelectedElementView from "./BigComponents/SelectedElementView.svelte";
  import LayerConfig from "../Models/ThemeConfig/LayerConfig";
  import Filterview from "./BigComponents/Filterview.svelte";
  import RasterLayerPicker from "./Map/RasterLayerPicker.svelte";
  import ThemeViewState from "../Models/ThemeViewState";
  import type { MapProperties } from "../Models/MapProperties";
  import Geosearch from "./BigComponents/Geosearch.svelte";
  import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui";
  import Translations from "./i18n/Translations";
  import { MenuIcon } from "@rgossiaux/svelte-heroicons/solid";
  import Tr from "./Base/Tr.svelte";

  export let layout: LayoutConfig;
  const state = new ThemeViewState(layout);

  let selectedElementTags: Store<UIEventSource<Record<string, string>>> =
    state.selectedElement.mapD((f) => {
        return state.featureProperties.getStore(f.properties.id);
      }
    );

  let maplibremap: UIEventSource<MlMap> = state.map;
  let selectedElement: UIEventSource<Feature> = state.selectedElement;
  let selectedLayer: UIEventSource<LayerConfig> = state.selectedLayer;
  let mapproperties: MapProperties = state.mapProperties;
  let featureSwitches: FeatureSwitchState = state.featureSwitches;
  let availableLayers = state.availableLayers;
</script>


<div class="h-screen w-screen absolute top-0 left-0 flex">
  <MaplibreMap map={maplibremap}></MaplibreMap>
</div>

<div class="absolute top-0 left-0 mt-2 ml-2">
  <MapControlButton on:click={() => state.guistate.welcomeMessageIsOpened.setData(true)}>
    <div class="flex mr-2 items-center">
      <img class="w-8 h-8 block mr-2" src={layout.icon}>
      <b>
        <Tr t={layout.title}></Tr>
      </b>
    </div>
  </MapControlButton>
  <MapControlButton on:click={() =>state.guistate.menuIsOpened.setData(true)}>
    <MenuIcon class="w-8 h-8"></MenuIcon>
  </MapControlButton>
</div>

<div class="absolute bottom-0 left-0 mb-4 ml-4">

</div>

<div class="absolute bottom-0 right-0 mb-4 mr-4">
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z+1)}>
    <ToSvelte construct={Svg.plus_ui}></ToSvelte>
  </MapControlButton>
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z-1)}>
    <ToSvelte class="w-7 h-7 block" construct={Svg.min_ui}></ToSvelte>
  </MapControlButton>
  <If condition={featureSwitches.featureSwitchGeolocation}>
    <MapControlButton>
      <ToSvelte
        construct={new GeolocationControl(state.geolocation, mapproperties).SetClass("block w-8 h-8")}></ToSvelte>
    </MapControlButton>
  </If>
</div>

<div class="absolute top-0 right-0 mt-4 mr-4">
  <If condition={state.featureSwitches.featureSwitchSearch}>
    <Geosearch bounds={state.mapProperties.bounds} layout={state.layout} location={state.mapProperties.location}
               {selectedElement} {selectedLayer}
              ></Geosearch>
  </If>
</div>


<If condition={state.guistate.welcomeMessageIsOpened}>
  <!-- Theme page -->
  <div class="absolute top-0 left-0 w-screen h-screen" style="background-color: #00000088">
    <div class="flex flex-col m-4 sm:m-6 md:m-8 p-4 sm:p-6 md:m-8 normal-background rounded">
      <div on:click={() => state.guistate.welcomeMessageIsOpened.setData(false)}>Close</div>
      <TabGroup>
        <TabList>
          <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
            <Tr t={layout.title}/>
          </Tab>
          <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
            <Tr t={Translations.t.general.menu.filter}/>
          </Tab>
          <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel class="flex flex-col">
            <Tr t={layout.description}></Tr>
            <Tr t={Translations.t.general.welcomeExplanation.general}/>
            {#if layout.layers.some((l) => l.presets?.length > 0)}
              <If condition={state.featureSwitches.featureSwitchAddNew}>
             <Tr t={Translations.t.general.welcomeExplanation.addNew}/>
              </If>
            {/if}

            <!--toTheMap,
            loginStatus.SetClass("block mt-6 pt-2 md:border-t-2 border-dotted border-gray-400"),
            -->
            <Tr t={layout.descriptionTail}></Tr>
            <div class="m-x-8">
              <button class="subtle-background rounded w-full p-4"
                      on:click={() => state.guistate.welcomeMessageIsOpened.setData(false)}>
                <Tr t={Translations.t.general.openTheMap} />
              </button>
            </div>


          </TabPanel>
          <TabPanel>
            <div class="flex flex-col">
              <!-- Filter panel -- TODO move to actual location-->
              {#each layout.layers as layer}
                <Filterview filteredLayer={state.layerState.filteredLayers.get(layer.id)}></Filterview>
              {/each}

              <RasterLayerPicker {availableLayers} value={mapproperties.rasterLayer}></RasterLayerPicker>
            </div>
          </TabPanel>
          <TabPanel>Content 3</TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</If>


<If condition={state.guistate.menuIsOpened}>
  <!-- Menu page -->
  <div class="absolute top-0 left-0 w-screen h-screen" style="background-color: #00000088">
    <div class="flex flex-col m-4 sm:m-6 md:m-8 p-4 sm:p-6 md:m-8 normal-background rounded">
      <div on:click={() => state.guistate.menuIsOpened.setData(false)}>Close</div>
      <TabGroup>
        <TabList>
          <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>About MapComplete</Tab>
          <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>Settings</Tab>
          <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>Privacy</Tab>
        </TabList>
        <TabPanels>
          <TabPanel class="flex flex-col">
            About MC


          </TabPanel>
          <TabPanel>User settings</TabPanel>
          <TabPanel>Privacy</TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</If>

{#if $selectedElement !== undefined && $selectedLayer !== undefined}
  <div class="absolute top-0 right-0 w-screen h-screen" style="background-color: #00000088">

    <div class="w-full m-8 normal-background rounded overflow-auto">
      
    <SelectedElementView layer={$selectedLayer} selectedElement={$selectedElement}
                         tags={$selectedElementTags} state={state}></SelectedElementView>

    </div>
  </div>
{/if}
<style>
    /* WARNING: This is just for demonstration.
        Using :global() in this way can be risky. */
    :global(.tab-selected) {
        background-color: rgb(59 130 246);
        color: rgb(255 255 255);
    }

    :global(.tab-unselected) {
        background-color: rgb(255 255 255);
        color: rgb(0 0 0);
    }
</style>
