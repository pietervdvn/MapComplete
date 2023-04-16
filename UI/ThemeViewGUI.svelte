<script lang="ts">
  import { Store, UIEventSource } from "../Logic/UIEventSource";
  import { Map as MlMap } from "maplibre-gl";
  import MaplibreMap from "./Map/MaplibreMap.svelte";
  import FeatureSwitchState from "../Logic/State/FeatureSwitchState";
  import MapControlButton from "./Base/MapControlButton.svelte";
  import ToSvelte from "./Base/ToSvelte.svelte";
  import Svg from "../Svg";
  import If from "./Base/If.svelte";
  import { GeolocationControl } from "./BigComponents/GeolocationControl";
  import type { Feature } from "geojson";
  import SelectedElementView from "./BigComponents/SelectedElementView.svelte";
  import LayerConfig from "../Models/ThemeConfig/LayerConfig";
  import Filterview from "./BigComponents/Filterview.svelte";
  import RasterLayerPicker from "./Map/RasterLayerPicker.svelte";
  import ThemeViewState from "../Models/ThemeViewState";
  import type { MapProperties } from "../Models/MapProperties";
  import Geosearch from "./BigComponents/Geosearch.svelte";
  import Translations from "./i18n/Translations";
  import { CogIcon, EyeIcon, MenuIcon } from "@rgossiaux/svelte-heroicons/solid";
  import Tr from "./Base/Tr.svelte";
  import CommunityIndexView from "./BigComponents/CommunityIndexView.svelte";
  import FloatOver from "./Base/FloatOver.svelte";
  import PrivacyPolicy from "./BigComponents/PrivacyPolicy";
  import { Utils } from "../Utils";
  import Constants from "../Models/Constants";
  import TabbedGroup from "./Base/TabbedGroup.svelte";
  import UserRelatedState from "../Logic/State/UserRelatedState";
  import LoginToggle from "./Base/LoginToggle.svelte";
  import LoginButton from "./Base/LoginButton.svelte";
  import CopyrightPanel from "./BigComponents/CopyrightPanel";
  import { DownloadPanel } from "./BigComponents/DownloadPanel";
  import ModalRight from "./Base/ModalRight.svelte";

  export let state: ThemeViewState;
  let layout = state.layout;

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
  let userdetails = state.osmConnection.userDetails;
</script>


<div class="h-screen w-screen absolute top-0 left-0 flex">
  <MaplibreMap map={maplibremap}></MaplibreMap>
</div>

<div class="absolute top-0 left-0 mt-2 ml-2">
  <MapControlButton on:click={() => state.guistate.themeIsOpened.setData(true)}>
    <div class="flex mr-2 items-center cursor-pointer">
      <img class="w-8 h-8 block mr-2" src={layout.icon}>
      <b>
        <Tr t={layout.title}></Tr>
      </b>
    </div>
  </MapControlButton>
  <MapControlButton on:click={() =>state.guistate.menuIsOpened.setData(true)}>
    <MenuIcon class="w-8 h-8 cursor-pointer"></MenuIcon>
  </MapControlButton>
  <If condition={state.featureSwitchIsTesting}>
    <span class="alert">
      Testmode
    </span>
  </If>
</div>

<div class="absolute bottom-0 left-0 mb-4 ml-4">

</div>

<div class="absolute bottom-0 right-0 mb-4 mr-4">
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z+1)}>
    <ToSvelte construct={Svg.plus_ui}></ToSvelte>
  </MapControlButton>
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z-1)}>
    <ToSvelte construct={Svg.min_ui}></ToSvelte>
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
    <Geosearch bounds={state.mapProperties.bounds} {selectedElement} {selectedLayer} perLayer={state.perLayer}></Geosearch>
  </If>
</div>

{#if $selectedElement !== undefined && $selectedLayer !== undefined}
  <ModalRight on:close={() => {selectedElement.setData(undefined)}}>
    <SelectedElementView layer={$selectedLayer} selectedElement={$selectedElement}
                         tags={$selectedElementTags} state={state} />
  </ModalRight>

{/if}

<If condition={state.guistate.themeIsOpened}>
  <!-- Theme page -->
  <FloatOver on:close={() => state.guistate.themeIsOpened.setData(false)}>
    <TabbedGroup tab={state.guistate.themeViewTabIndex}>
      <Tr slot="title0" t={layout.title} />

      <div slot="content0">

        <Tr t={layout.description}></Tr>
        <Tr t={Translations.t.general.welcomeExplanation.general} />
        {#if layout.layers.some((l) => l.presets?.length > 0)}
          <If condition={state.featureSwitches.featureSwitchAddNew}>
            <Tr t={Translations.t.general.welcomeExplanation.addNew} />
          </If>
        {/if}

        <!--toTheMap,
        loginStatus.SetClass("block mt-6 pt-2 md:border-t-2 border-dotted border-gray-400"),
        -->
        <Tr t={layout.descriptionTail}></Tr>
        <div class="m-x-8">
          <button class="subtle-background rounded w-full p-4"
                  on:click={() => state.guistate.themeIsOpened.setData(false)}>
            <Tr t={Translations.t.general.openTheMap} />
          </button>
        </div>

      </div>

      <div class="flex" slot="title1">
        <If condition={state.featureSwitches.featureSwitchFilter}>
          <img class="w-4 h-4" src="./assets/svg/filter.svg">
          <Tr t={Translations.t.general.menu.filter} />
        </If>
      </div>

      <div class="flex flex-col" slot="content1">
        {#each layout.layers as layer}
          <Filterview zoomlevel={state.mapProperties.zoom} filteredLayer={state.layerState.filteredLayers.get(layer.id)}
                      highlightedLayer={state.guistate.highlightedLayerInFilters}></Filterview>
        {/each}
        <If condition={state.featureSwitches.featureSwitchBackgroundSelection}>
          <RasterLayerPicker {availableLayers} value={mapproperties.rasterLayer}></RasterLayerPicker>
        </If>
      </div>
      <div slot="title2" class="flex">
        <img src="./assets/svg/download.svg" class="w-4 h-4"/>
        <Tr t={Translations.t.general.download.title}/>
      </div>
      <div slot="content2">
        <ToSvelte construct={() => new DownloadPanel(state)}/>
      </div>
      
      <div slot="title3">
        <Tr t={Translations.t.general.attribution.title}/>
      </div>
      
      <ToSvelte slot="content3" construct={() => new CopyrightPanel(state)}></ToSvelte>
      

    </TabbedGroup>
  </FloatOver>
</If>


<If condition={state.guistate.menuIsOpened}>
  <!-- Menu page -->
  <FloatOver on:close={() => state.guistate.menuIsOpened.setData(false)}>
    <TabbedGroup tab={state.guistate.menuViewTabIndex}>
      <div class="flex" slot="title0">
        <Tr t={Translations.t.general.aboutMapcompleteTitle}></Tr>
      </div>

      <div class="flex flex-col" slot="content0">
        <Tr t={Translations.t.general.aboutMapcomplete.Subs({
                    osmcha_link: Utils.OsmChaLinkFor(7),
                })}></Tr>

        {Constants.vNumber}
      </div>

      <If condition={state.osmConnection.isLoggedIn} slot="title1">
        <div class="flex">
          <CogIcon class="w-6 h-6" />
          <Tr t={UserRelatedState.usersettingsConfig.title.GetRenderValue({})} />
        </div>
      </If>

      <div slot="content1">
        <!-- All shown components are set by 'usersettings.json', which happily uses some special visualisations created specifically for it -->
        <LoginToggle {state}>
          <div slot="not-logged-in">
            <Tr class="alert" t={Translations.t.userinfo.notLoggedIn}/>
            <LoginButton osmConnection={state.osmConnection}></LoginButton>
          </div>
          <SelectedElementView
            layer={UserRelatedState.usersettingsConfig}
            selectedElement={({
        type:"Feature",properties: {}, geometry: {type:"Point", coordinates: [0,0]}
        })} {state}
            tags={state.userRelatedState.preferencesAsTags} 
          highlightedRendering={state.guistate.highlightedUserSetting}
          />
        </LoginToggle>
      </div>

      <div class="flex" slot="title2">
        <img class="w-6" src="./assets/svg/community.svg">
        Get in touch with others
      </div>
      <CommunityIndexView location={state.mapProperties.location} slot="content2"></CommunityIndexView>

      <div class="flex" slot="title3">
        <EyeIcon class="w-6" />
        <Tr t={Translations.t.privacy.title}></Tr>
      </div>
      <ToSvelte construct={() => new PrivacyPolicy()} slot="content3"></ToSvelte>
    </TabbedGroup>
  </FloatOver>
</If>


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
