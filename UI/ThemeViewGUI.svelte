<script lang="ts">
    import {Store, UIEventSource} from "../Logic/UIEventSource";
    import {Map as MlMap} from "maplibre-gl";
    import MaplibreMap from "./Map/MaplibreMap.svelte";
    import FeatureSwitchState from "../Logic/State/FeatureSwitchState";
    import MapControlButton from "./Base/MapControlButton.svelte";
    import ToSvelte from "./Base/ToSvelte.svelte";
    import If from "./Base/If.svelte";
    import {GeolocationControl} from "./BigComponents/GeolocationControl";
    import type {Feature} from "geojson";
    import SelectedElementView from "./BigComponents/SelectedElementView.svelte";
    import LayerConfig from "../Models/ThemeConfig/LayerConfig";
    import Filterview from "./BigComponents/Filterview.svelte";
    import ThemeViewState from "../Models/ThemeViewState";
    import type {MapProperties} from "../Models/MapProperties";
    import Geosearch from "./BigComponents/Geosearch.svelte";
    import Translations from "./i18n/Translations";
    import {CogIcon, EyeIcon, MenuIcon, XCircleIcon} from "@rgossiaux/svelte-heroicons/solid";
    import {Square3Stack3dIcon} from "@babeard/svelte-heroicons/solid";

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
    import {DownloadPanel} from "./BigComponents/DownloadPanel";
    import ModalRight from "./Base/ModalRight.svelte";
    import {Utils} from "../Utils";
    import Hotkeys from "./Base/Hotkeys";
    import {VariableUiElement} from "./Base/VariableUIElement";
    import SvelteUIElement from "./Base/SvelteUIElement";
    import OverlayToggle from "./BigComponents/OverlayToggle.svelte";
    import LevelSelector from "./BigComponents/LevelSelector.svelte";
    import ExtraLinkButton from "./BigComponents/ExtraLinkButton";
    import SelectedElementTitle from "./BigComponents/SelectedElementTitle.svelte";
    import Svg from "../Svg";
    import {ShareScreen} from "./BigComponents/ShareScreen";
    import ThemeIntroPanel from "./BigComponents/ThemeIntroPanel.svelte";
    import type {Readable} from "svelte/store";
    import type {RasterLayerPolygon} from "../Models/RasterLayers";
    import RasterLayerPicker from "./Map/RasterLayerPicker.svelte";
    import RasterLayerOverview from "./Map/RasterLayerOverview.svelte";
    import IfHidden from "./Base/IfHidden.svelte";
    import {onDestroy} from "svelte";
    import {AvailableRasterLayers} from "../Models/RasterLayers";

    export let state: ThemeViewState;
    let layout = state.layout;

    let maplibremap: UIEventSource<MlMap> = state.map;
    let selectedElement: UIEventSource<Feature> = state.selectedElement;
    let selectedLayer: UIEventSource<LayerConfig> = state.selectedLayer;

    const selectedElementView = selectedElement.map(selectedElement => {
        // Svelte doesn't properly reload some of the legacy UI-elements
        // As such, we _reconstruct_ the selectedElementView every time a new feature is selected
        // This is a bit wasteful, but until everything is a svelte-component, this should do the trick
        const layer = selectedLayer.data;
        if (selectedElement === undefined || layer === undefined) {
            return undefined;
        }

        if (!(layer.tagRenderings?.length > 0) || layer.title === undefined) {
            return undefined
        }

        const tags = state.featureProperties.getStore(selectedElement.properties.id);
        return new SvelteUIElement(SelectedElementView, {state, layer, selectedElement, tags})
    }, [selectedLayer]);

    const selectedElementTitle = selectedElement.map(selectedElement => {
        // Svelte doesn't properly reload some of the legacy UI-elements
        // As such, we _reconstruct_ the selectedElementView every time a new feature is selected
        // This is a bit wasteful, but until everything is a svelte-component, this should do the trick
        const layer = selectedLayer.data;
        if (selectedElement === undefined || layer === undefined) {
            return undefined;
        }

        const tags = state.featureProperties.getStore(selectedElement.properties.id);
        return new SvelteUIElement(SelectedElementTitle, {state, layer, selectedElement, tags})
    }, [selectedLayer]);


    let mapproperties: MapProperties = state.mapProperties;
    let featureSwitches: FeatureSwitchState = state.featureSwitches;
    let availableLayers = state.availableLayers;
    let userdetails = state.osmConnection.userDetails;
    let currentViewLayer = layout.layers.find(l => l.id === "current_view")
    let rasterLayer: Store<RasterLayerPolygon> = state.mapProperties.rasterLayer
    let rasterLayerName = rasterLayer.data?.properties?.name ?? AvailableRasterLayers.maplibre.properties.name
    onDestroy(rasterLayer.addCallbackAndRunD(l => {
        rasterLayerName = l.properties.name
    }))
</script>


<div class="h-screen w-screen absolute top-0 left-0 overflow-hidden">
    <MaplibreMap map={maplibremap}></MaplibreMap>
</div>

<div class="absolute top-0 left-0 w-full pointer-events-none">
    <!-- Top components -->
    <If condition={state.featureSwitches.featureSwitchSearch}>
        <div class="max-[480px]:w-full float-right mt-1 px-1 sm:m-2 pointer-events-auto">
            <Geosearch bounds={state.mapProperties.bounds} perLayer={state.perLayer} {selectedElement}
                       {selectedLayer}/>
        </div>
    </If>
    <div class="float-left m-1 sm:mt-2 flex flex-col">
        <MapControlButton on:click={() => state.guistate.themeIsOpened.setData(true)}>
            <div class="flex m-0.5 mx-1 sm:mx-1 md:mx-2 items-center cursor-pointer max-[480px]:w-full">
                <img class="w-6 h-6 md:w-8 md:h-8 block mr-0.5 sm:mr-1 md:mr-2" src={layout.icon}>
                <b class="mr-1">
                    <Tr t={layout.title}></Tr>
                </b>
            </div>
        </MapControlButton>
        <MapControlButton on:click={() =>state.guistate.menuIsOpened.setData(true)}>
            <MenuIcon class="w-8 h-8 cursor-pointer"></MenuIcon>
        </MapControlButton>
        {#if currentViewLayer?.tagRenderings}
            <MapControlButton
                    on:click={() => {selectedLayer.setData(currentViewLayer); selectedElement.setData(state.currentView.features?.data?.[0])}}>
                <ToSvelte
                        construct={() =>(currentViewLayer.defaultIcon()).SetClass("w-8 h-8 cursor-pointer")}/>
            </MapControlButton>
        {/if}
        <ToSvelte construct={() => new ExtraLinkButton(state, layout.extraLink).SetClass("pointer-events-auto")}></ToSvelte>
        <If condition={state.featureSwitchIsTesting}>
            <div class="alert w-fit">
                Testmode
            </div>
        </If>

    </div>
</div>

<div class="absolute bottom-0 left-0 mb-4 w-screen pointer-events-none">
    <div class="w-full flex justify-between px-4 items-end">
        <div>
            <!-- bottom left elements -->
            <MapControlButton on:click={() => state.guistate.backgroundLayerSelectionIsOpened.setData(true)}>
                <Square3Stack3dIcon class="w-6 h-6"/>
            </MapControlButton>
            <a class="pointer-events-auto opacity-50 hover:opacity-100 text-white cursor-pointer bg-black-transparent px-1 rounded-2xl" 
               on:click={() =>{ state.guistate.themeViewTab.setData("copyright"); state.guistate.themeIsOpened.setData(true)}}>
                © OpenStreetMap | <span class="w-24">{rasterLayerName}</span>
            </a>
        </div>

        <div class="flex flex-col items-end">
            <!-- bottom right elements -->
            <If condition={state.floors.map(f => f.length > 1)}>
                <div class="mr-0.5 pointer-events-auto">
                    <LevelSelector floors={state.floors} layerState={state.layerState} zoom={state.mapProperties.zoom}/>
                </div>
            </If>
            <MapControlButton on:click={() => mapproperties.zoom.update(z => z+1)}>
                <ToSvelte construct={Svg.plus_svg().SetClass("w-8 h-8")}/>
            </MapControlButton>
            <MapControlButton on:click={() => mapproperties.zoom.update(z => z-1)}>
                <ToSvelte construct={Svg.min_svg().SetClass("w-8 h-8")}/>
            </MapControlButton>
            <If condition={featureSwitches.featureSwitchGeolocation}>
                <MapControlButton>
                    <ToSvelte
                            construct={new GeolocationControl(state.geolocation, mapproperties).SetClass("block w-8 h-8")}></ToSvelte>
                </MapControlButton>
            </If>
        </div>
    </div>

</div>

<If condition={selectedElementView.map(v => v !== undefined && selectedLayer.data !== undefined && !selectedLayer.data.popupInFloatover,[ selectedLayer] )}>
    <ModalRight on:close={() => {selectedElement.setData(undefined)}}>
        <div class="absolute flex flex-col h-full w-full normal-background">
            <ToSvelte construct={new VariableUiElement(selectedElementTitle)}>
                <!-- Title -->
            </ToSvelte>
            <ToSvelte construct={new VariableUiElement(selectedElementView).SetClass("overflow-auto")}>
                <!-- Main view -->
            </ToSvelte>
        </div>
    </ModalRight>
</If>

<If condition={selectedElementView.map(v => v !== undefined && selectedLayer.data !== undefined && selectedLayer.data.popupInFloatover,[ selectedLayer] )}>
    <FloatOver on:close={() => {selectedElement.setData(undefined)}}>
        <ToSvelte construct={new VariableUiElement(selectedElementView)}></ToSvelte>
    </FloatOver>
</If>

<If condition={state.guistate.themeIsOpened}>
    <!-- Theme menu -->
    <FloatOver>
        <span slot="close-button"><!-- Disable the close button --></span>
        <TabbedGroup tab={state.guistate.themeViewTabIndex}>
            <div slot="post-tablist">
                <XCircleIcon class="w-8 h-8 mr-2" on:click={() => state.guistate.themeIsOpened.setData(false)}/>
            </div>

            <div class="flex" slot="title0">
                <img class="w-4 h-4 block" src={layout.icon}>
                <Tr t={layout.title}/>
            </div>

            <div class="m-4" slot="content0">

                <ThemeIntroPanel {state}/>

            </div>

            <div class="flex" slot="title1">
                <If condition={state.featureSwitches.featureSwitchFilter}>
                    <ToSvelte construct={Svg.filter_svg().SetClass("w-4 h-4")}/>
                    <Tr t={Translations.t.general.menu.filter}/>
                </If>
            </div>

            <div class="flex flex-col m-2" slot="content1">
                {#each layout.layers as layer}
                    <Filterview zoomlevel={state.mapProperties.zoom}
                                filteredLayer={state.layerState.filteredLayers.get(layer.id)}
                                highlightedLayer={state.guistate.highlightedLayerInFilters}/>
                {/each}
                {#each layout.tileLayerSources as tilesource}
                    <OverlayToggle
                            layerproperties={tilesource}
                            state={state.overlayLayerStates.get(tilesource.id)}
                            highlightedLayer={state.guistate.highlightedLayerInFilters}
                            zoomlevel={state.mapProperties.zoom}
                    />
                {/each}
            </div>
            <div class="flex" slot="title2">
                <If condition={state.featureSwitches.featureSwitchEnableExport}>
                    <ToSvelte construct={Svg.download_svg().SetClass("w-4 h-4")}/>
                    <Tr t={Translations.t.general.download.title}/>
                </If>
            </div>
            <div class="m-4" slot="content2">
                <ToSvelte construct={() => new DownloadPanel(state)}/>
            </div>

            <div slot="title3">
                <Tr t={Translations.t.general.attribution.title}/>
            </div>

            <ToSvelte construct={() => new CopyrightPanel(state)} slot="content3"></ToSvelte>

            <div slot="title4">
                <Tr t={Translations.t.general.sharescreen.title}/>
            </div>
            <div class="m-2" slot="content4">
                <ToSvelte construct={() => new ShareScreen(state)}/>
            </div>

        </TabbedGroup>
    </FloatOver>
</If>

<IfHidden condition={state.guistate.backgroundLayerSelectionIsOpened}>
    <!-- background layer selector -->
    <FloatOver on:close={() => state.guistate.backgroundLayerSelectionIsOpened.setData(false)}>
        <div class="p-2 h-full">
            <RasterLayerOverview userstate={state.userRelatedState} mapproperties={state.mapProperties} map={state.map} {availableLayers} visible={state.guistate.backgroundLayerSelectionIsOpened}/>
        </div>
    </FloatOver>
</IfHidden>

<If condition={state.guistate.menuIsOpened}>
    <!-- Menu page -->
    <FloatOver>
        <span slot="close-button"><!-- Hide the default close button --></span>
        <TabbedGroup tab={state.guistate.menuViewTabIndex}>
            <div slot="post-tablist">
                <XCircleIcon class="w-8 h-8 mr-2" on:click={() => state.guistate.menuIsOpened.setData(false)}/>
            </div>
            <div class="flex" slot="title0">
                <Tr t={Translations.t.general.menu.aboutMapComplete}/>
            </div>

            <div class="flex flex-col m-2 links-as-button links-w-full gap-y-1" slot="content0">

                <Tr t={Translations.t.general.aboutMapComplete.intro}/>

                <a class="flex" href={Utils.HomepageLink()}>
                    <img class="w-6 h-6" src="./assets/svg/add.svg">
                    <Tr t={Translations.t.general.backToIndex}/>
                </a>

                <a class="flex" href="https://github.com/pietervdvn/MapComplete/issues" target="_blank">
                    <img class="w-6 h-6" src="./assets/svg/bug.svg">
                    <Tr t={Translations.t.general.attribution.openIssueTracker}/>
                </a>


                <a class="flex" href="https://en.osm.town/@MapComplete" target="_blank">
                    <img class="w-6 h-6" src="./assets/svg/mastodon.svg">
                    <Tr t={Translations.t.general.attribution.followOnMastodon}/>
                </a>

                <a class="flex" href="https://liberapay.com/pietervdvn/" target="_blank">
                    <img class="w-6 h-6" src="./assets/svg/liberapay.svg">
                    <Tr t={Translations.t.general.attribution.donate}/>
                </a>

                <a class="flex" href={Utils.OsmChaLinkFor(7)} target="_blank">
                    <img class="w-6 h-6" src="./assets/svg/statistics.svg">
                    <Tr t={Translations.t.general.attribution.openOsmcha.Subs({theme: "MapComplete"})}/>
                </a>
                {Constants.vNumber}
            </div>


            <div class="flex" slot="title1">
                <CogIcon class="w-6 h-6"/>
                <Tr t={UserRelatedState.usersettingsConfig.title.GetRenderValue({})}/>
            </div>

            <div class="links-as-button" slot="content1">
                <!-- All shown components are set by 'usersettings.json', which happily uses some special visualisations created specifically for it -->
                <LoginToggle {state}>
                    <div class="flex flex-col" slot="not-logged-in">
                        <Tr class="alert" t={Translations.t.userinfo.notLoggedIn}/>
                        <LoginButton clss="primary" osmConnection={state.osmConnection}/>
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
                <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")}/>
                Get in touch with others
            </div>
            <div class="m-2" slot="content2">
                <CommunityIndexView location={state.mapProperties.location}></CommunityIndexView>
            </div>

            <div class="flex" slot="title3">
                <EyeIcon class="w-6"/>
                <Tr t={Translations.t.privacy.title}></Tr>
            </div>
            <div class="m-2" slot="content3">
                <ToSvelte construct={() => new PrivacyPolicy()}/>
            </div>

            <Tr slot="title4" t={Translations.t.advanced.title}/>
            <div class="flex flex-col m-2" slot="content4">
                <ToSvelte construct={Hotkeys.generateDocumentationDynamic}></ToSvelte>

            </div>
        </TabbedGroup>
    </FloatOver>
</If>

