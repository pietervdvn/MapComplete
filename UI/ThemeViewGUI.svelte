<script lang="ts">
  import { UIEventSource } from "../Logic/UIEventSource";
  import { Map as MlMap } from "maplibre-gl";
  import MaplibreMap from "./Map/MaplibreMap.svelte";
  import FeatureSwitchState from "../Logic/State/FeatureSwitchState";
  import MapControlButton from "./Base/MapControlButton.svelte";
  import ToSvelte from "./Base/ToSvelte.svelte";
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
  import Constants from "../Models/Constants";
  import TabbedGroup from "./Base/TabbedGroup.svelte";
  import UserRelatedState from "../Logic/State/UserRelatedState";
  import LoginToggle from "./Base/LoginToggle.svelte";
  import LoginButton from "./Base/LoginButton.svelte";
  import CopyrightPanel from "./BigComponents/CopyrightPanel";
  import { DownloadPanel } from "./BigComponents/DownloadPanel";
  import ModalRight from "./Base/ModalRight.svelte";
  import { Utils } from "../Utils";
  import Hotkeys from "./Base/Hotkeys";
  import { VariableUiElement } from "./Base/VariableUIElement";
  import SvelteUIElement from "./Base/SvelteUIElement";
  import OverlayToggle from "./BigComponents/OverlayToggle.svelte";
  import LevelSelector from "./BigComponents/LevelSelector.svelte";

  export let state: ThemeViewState;
  let layout = state.layout;

  let maplibremap: UIEventSource<MlMap> = state.map;
  let selectedElement: UIEventSource<Feature> = state.selectedElement;
  let selectedLayer: UIEventSource<LayerConfig> = state.selectedLayer;

  const selectedViewElement = selectedElement.map(selectedElement => {
    // Svelte doesn't properly reload some of the legacy UI-elements
    // As such, we _reconstruct_ the selectedElementView every time a new feature is selected
    // This is a bit wasteful, but until everything is a svelte-component, this should do the trick
    const layer = selectedLayer.data;
    if (selectedElement === undefined || layer === undefined) {
      return undefined;
    }

    const tags = state.featureProperties.getStore(selectedElement.properties.id);
    return new SvelteUIElement(SelectedElementView, { state, layer, selectedElement, tags });
  }, [selectedLayer]);


  let mapproperties: MapProperties = state.mapProperties;
  let featureSwitches: FeatureSwitchState = state.featureSwitches;
  let availableLayers = state.availableLayers;
  let userdetails = state.osmConnection.userDetails;
</script>


<div class="h-screen w-screen absolute top-0 left-0 overflow-hidden">
  <MaplibreMap map={maplibremap}></MaplibreMap>
</div>

<div class="absolute top-0 left-0 w-full ">
  <!-- Top components -->
  <If condition={state.featureSwitches.featureSwitchSearch}>
    <div class="max-[480px]:w-full float-right mt-1 px-1 sm:m-2">
      <Geosearch bounds={state.mapProperties.bounds} perLayer={state.perLayer} {selectedElement}
                 {selectedLayer}></Geosearch>
    </div>
  </If>
  <div class="float-left m-1 sm:mt-2">
    <MapControlButton on:click={() => state.guistate.themeIsOpened.setData(true)}>
      <div class="flex m-0.5 mx-1 sm:mx-1 md:mx-2 items-center cursor-pointer max-[480px]:w-full">
        <img class="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 block mr-0.5 sm:mr-1 md:mr-2" src={layout.icon}>
        <b class="mr-1">
          <Tr t={layout.title}></Tr>
        </b>
      </div>
    </MapControlButton>
    <MapControlButton on:click={() =>state.guistate.menuIsOpened.setData(true)}>
      <MenuIcon class="w-6 h-6 md:w-8 md:h-8 cursor-pointer"></MenuIcon>
    </MapControlButton>
    <If condition={state.featureSwitchIsTesting}>
    <span class="alert">
      Testmode
    </span>
    </If>

  </div>
</div>

<div class="absolute bottom-0 left-0 mb-4 ml-4">

</div>

<div class="absolute bottom-0 right-0 mb-4 mr-4 flex flex-col items-end">
  <If condition={state.floors.map(f => f.length > 1)}>
    <div class="mr-0.5">
    <LevelSelector floors={state.floors} layerState={state.layerState} zoom={state.mapProperties.zoom}/>
    </div>
  </If>
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z+1)}>
    <img src="./assets/svg/plus.svg" class="w-6 h-6 md:w-8 md:h-8"/>
  </MapControlButton>
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z-1)}>
    <img src="./assets/svg/min.svg" class="w-6 h-6 md:w-8 md:h-8"/>
  </MapControlButton>
  <If condition={featureSwitches.featureSwitchGeolocation}>
    <MapControlButton>
      <ToSvelte
        construct={new GeolocationControl(state.geolocation, mapproperties).SetClass("block w-6 h-6 md:w-8 md:h-8")}></ToSvelte>
    </MapControlButton>
  </If>
</div>

<If condition={selectedViewElement.map(v => v !== undefined)}>
  <ModalRight on:close={() => {selectedElement.setData(undefined)}}>
    <ToSvelte construct={new VariableUiElement(selectedViewElement)}></ToSvelte>
  </ModalRight>
</If>

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
        {#each layout.tileLayerSources as tilesource}
          <OverlayToggle
            layerproperties={tilesource}
            state={state.overlayLayerStates.get(tilesource.id)}
            highlightedLayer={state.guistate.highlightedLayerInFilters}
            zoomlevel={state.mapProperties.zoom}
          />
        {/each}
        <If condition={state.featureSwitches.featureSwitchBackgroundSelection}>
          <RasterLayerPicker {availableLayers} value={mapproperties.rasterLayer}></RasterLayerPicker>
        </If>
      </div>
      <div class="flex" slot="title2">
        <If condition={state.featureSwitches.featureSwitchEnableExport}>
          <img class="w-4 h-4" src="./assets/svg/download.svg" />
          <Tr t={Translations.t.general.download.title} />
        </If>
      </div>
      <div slot="content2">
        <ToSvelte construct={() => new DownloadPanel(state)} />
      </div>

      <div slot="title3">
        <Tr t={Translations.t.general.attribution.title} />
      </div>

      <ToSvelte construct={() => new CopyrightPanel(state)} slot="content3"></ToSvelte>


    </TabbedGroup>
  </FloatOver>
</If>


<If condition={state.guistate.menuIsOpened}>
  <!-- Menu page -->
  <FloatOver on:close={() => state.guistate.menuIsOpened.setData(false)}>
    <TabbedGroup tab={state.guistate.menuViewTabIndex}>
      <div class="flex" slot="title0">
        <Tr t={Translations.t.general.menu.aboutMapComplete} />
      </div>

      <div class="flex flex-col" slot="content0">

        <Tr t={Translations.t.general.aboutMapComplete.intro} />

        <a class="flex" href={Utils.HomepageLink()}>
          <img class="w-6 h-6" src="./assets/svg/add.svg">
          <Tr t={Translations.t.general.backToIndex} />
        </a>

        <a class="flex" href="https://github.com/pietervdvn/MapComplete/issues" target="_blank">
          <img class="w-6 h-6" src="./assets/svg/bug.svg">
          <Tr t={Translations.t.general.attribution.openIssueTracker} />
        </a>


        <a class="flex" href="https://en.osm.town/@MapComplete" target="_blank">
          <img class="w-6 h-6" src="./assets/svg/mastodon.svg">
          <Tr t={Translations.t.general.attribution.followOnMastodon} />
        </a>

        <a class="flex" href="https://liberapay.com/pietervdvn/" target="_blank">
          <img class="w-6 h-6" src="./assets/svg/liberapay.svg">
          <Tr t={Translations.t.general.attribution.donate} />
        </a>

        <a class="flex" href={Utils.OsmChaLinkFor(7)} target="_blank">
          <img class="w-6 h-6" src="./assets/svg/statistics.svg">
          <Tr t={Translations.t.general.attribution.openOsmcha.Subs({theme: "MapComplete"})} />
        </a>
        {Constants.vNumber}
        <ToSvelte construct={Hotkeys.generateDocumentationDynamic}></ToSvelte>
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
            <Tr class="alert" t={Translations.t.userinfo.notLoggedIn} />
            <LoginButton osmConnection={state.osmConnection}></LoginButton>
          </div>
          <SelectedElementView
            highlightedRendering={state.guistate.highlightedUserSetting}
            layer={UserRelatedState.usersettingsConfig} selectedElement={({
        type:"Feature",properties: {}, geometry: {type:"Point", coordinates: [0,0]}
        })}
            {state}
            tags={state.userRelatedState.preferencesAsTags}
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

