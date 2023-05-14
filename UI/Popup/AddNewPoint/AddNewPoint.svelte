<script lang="ts">
    /**
     * This component ties together all the steps that are needed to create a new point.
     * There are many subcomponents which help with that
     */
    import type {SpecialVisualizationState} from "../../SpecialVisualization";
    import PresetList from "./PresetList.svelte";
    import type PresetConfig from "../../../Models/ThemeConfig/PresetConfig";
    import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
    import Tr from "../../Base/Tr.svelte";
    import SubtleButton from "../../Base/SubtleButton.svelte";
    import FromHtml from "../../Base/FromHtml.svelte";
    import Translations from "../../i18n/Translations.js";
    import TagHint from "../TagHint.svelte";
    import {And} from "../../../Logic/Tags/And.js";
    import LoginToggle from "../../Base/LoginToggle.svelte";
    import Constants from "../../../Models/Constants.js";
    import FilteredLayer from "../../../Models/FilteredLayer";
    import {Store, UIEventSource} from "../../../Logic/UIEventSource";
    import {EyeIcon, EyeOffIcon} from "@rgossiaux/svelte-heroicons/solid";
    import LoginButton from "../../Base/LoginButton.svelte";
    import NewPointLocationInput from "../../BigComponents/NewPointLocationInput.svelte";
    import CreateNewNodeAction from "../../../Logic/Osm/Actions/CreateNewNodeAction";
    import {OsmWay} from "../../../Logic/Osm/OsmObject";
    import {Tag} from "../../../Logic/Tags/Tag";
    import type {WayId} from "../../../Models/OsmFeature";
    import Loading from "../../Base/Loading.svelte";
    import type {GlobalFilter} from "../../../Models/GlobalFilter";
    import {onDestroy} from "svelte";
    import NextButton from "../../Base/NextButton.svelte";
    import BackButton from "../../Base/BackButton.svelte";
    import ToSvelte from "../../Base/ToSvelte.svelte";
    import Svg from "../../../Svg";

    export let coordinate: { lon: number, lat: number };
    export let state: SpecialVisualizationState;

    let selectedPreset: {
        preset: PresetConfig,
        layer: LayerConfig,
        icon: string,
        tags: Record<string, string>
    } = undefined;
    let checkedOfGlobalFilters: number = 0
    let confirmedCategory = false;
    $: if (selectedPreset === undefined) {
        confirmedCategory = false;
        creating = false;
        checkedOfGlobalFilters = 0

    }

    let flayer: FilteredLayer = undefined;
    let layerIsDisplayed: UIEventSource<boolean> | undefined = undefined;
    let layerHasFilters: Store<boolean> | undefined = undefined;
    let globalFilter: UIEventSource<GlobalFilter[]> = state.layerState.globalFilters;
    let _globalFilter: GlobalFilter[] = [];
    onDestroy(globalFilter.addCallbackAndRun(globalFilter => {
        console.log("Global filters are", globalFilter);
        _globalFilter = globalFilter ?? [];
    }));
    $:{
        flayer = state.layerState.filteredLayers.get(selectedPreset?.layer?.id);
        layerIsDisplayed = flayer?.isDisplayed;
        layerHasFilters = flayer?.hasFilter;
    }
    const t = Translations.t.general.add;

    const zoom = state.mapProperties.zoom;

    const isLoading = state.dataIsLoading;
    let preciseCoordinate: UIEventSource<{ lon: number, lat: number }> = new UIEventSource(undefined);
    let snappedToObject: UIEventSource<string> = new UIEventSource<string>(undefined);

    let creating = false;

    /**
     * Call when the user should restart the flow by clicking on the map, e.g. because they disabled filters.
     * Will delete the lastclick-location
     */
    function abort() {
        state.selectedElement.setData(undefined);
        // When aborted, we force the contributors to place the pin _again_
        // This is because there might be a nearby object that was disabled; this forces them to re-evaluate the map
        state.lastClickObject.features.setData([]);
    }

    async function confirm() {
        creating = true;
        const location: { lon: number; lat: number } = preciseCoordinate.data;
        const snapTo: WayId | undefined = <WayId>snappedToObject.data;
        const tags: Tag[] = selectedPreset.preset.tags.concat(..._globalFilter.map(f => f?.onNewPoint?.tags ?? []));
        console.log("Creating new point at", location, "snapped to", snapTo, "with tags", tags);

        let snapToWay: undefined | OsmWay = undefined;
        if (snapTo !== undefined) {
            const downloaded = await state.osmObjectDownloader.DownloadObjectAsync(snapTo, 0);
            if (downloaded !== "deleted") {
                snapToWay = downloaded;
            }
        }

        const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon,
            {
                theme: state.layout?.id ?? "unkown",
                changeType: "create",
                snapOnto: snapToWay
            });
        await state.changes.applyAction(newElementAction);
        state.newFeatures.features.ping();
        // The 'changes' should have created a new point, which added this into the 'featureProperties'
        const newId = newElementAction.newElementId;
        console.log("Applied pending changes, fetching store for", newId);
        const tagsStore = state.featureProperties.getStore(newId);
        {
            // Set some metainfo
            const properties = tagsStore.data;
            if (snapTo) {
                // metatags (starting with underscore) are not uploaded, so we can safely mark this
                delete properties["_referencing_ways"];
                properties["_referencing_ways"] = `["${snapTo}"]`;
            }
            properties["_backend"] = state.osmConnection.Backend();
            properties["_last_edit:timestamp"] = new Date().toISOString();
            const userdetails = state.osmConnection.userDetails.data;
            properties["_last_edit:contributor"] = userdetails.name;
            properties["_last_edit:uid"] = "" + userdetails.uid;
            tagsStore.ping();
        }
        const feature = state.indexedFeatures.featuresById.data.get(newId);
        abort();
        state.selectedLayer.setData(selectedPreset.layer);
        state.selectedElement.setData(feature);
        tagsStore.ping();

    }

</script>

<LoginToggle ignoreLoading={true} {state}>
    <!-- This component is basically one big if/then/else flow checking for many conditions and edge cases that (in some cases) have to be handled;
    1. the first (and outermost) is of course: are we logged in?
    2. What do we want to add?
    3. Are all elements of this category visible? (i.e. there are no filters possibly hiding this, is the data still loading, ...) -->
    <LoginButton osmConnection={state.osmConnection} slot="not-logged-in">
        <Tr slot="message" t={Translations.t.general.add.pleaseLogin}/>
    </LoginButton>
    {#if $isLoading}
        <div class="alert">
            <Loading>
                <Tr t={Translations.t.general.add.stillLoading}/>
            </Loading>
        </div>
    {:else if $zoom < Constants.minZoomLevelToAddNewPoint}
        <div class="alert">
            <Tr t={Translations.t.general.add.zoomInFurther}></Tr>
        </div>
    {:else if selectedPreset === undefined}
        <!-- First, select the correct preset -->
        <PresetList {state} on:select={event => {selectedPreset = event.detail}}></PresetList>


    {:else if !$layerIsDisplayed}
        <!-- Check that the layer is enabled, so that we don't add a duplicate -->
        <div class="alert flex  justify-center items-center">
            <EyeOffIcon class="w-8"/>
            <Tr t={Translations.t.general.add.layerNotEnabled
                    .Subs({ layer: selectedPreset.layer.name })
                   }/>
        </div>

        <div class="flex flex-wrap-reverse md:flex-nowrap">

            <button class="flex w-full gap-x-1"
                    on:click={() => {abort();state.guistate.openFilterView(selectedPreset.layer)}}>
                <ToSvelte construct={Svg.layers_svg().SetClass("w-12")}/>
                <Tr t={Translations.t.general.add.openLayerControl}/>
            </button>

            <button class="flex w-full gap-x-1 primary" on:click={() => {layerIsDisplayed.setData(true);abort()}}>
                <EyeIcon class="w-12"/>
                <Tr t={Translations.t.general.add.enableLayer.Subs({name: selectedPreset.layer.name})}/>
            </button>
        </div>


    {:else if $layerHasFilters}
        <!-- Some filters are enabled. The feature to add might already be mapped, but hidden -->
        <div class="alert flex justify-center items-center">
            <EyeOffIcon class="w-8"/>
            <Tr t={Translations.t.general.add.disableFiltersExplanation}/>
        </div>
        <div class="flex flex-wrap-reverse md:flex-nowrap">
            <button class="flex w-full gap-x-1 primary"
                    on:click={() => {abort(); state.layerState.filteredLayers.get(selectedPreset.layer.id).disableAllFilters()}    }>
                <EyeOffIcon class="w-12"/>
                <Tr t={Translations.t.general.add.disableFilters}/>
            </button>
            <button class="flex w-full gap-x-1" on:click={() => {abort();state.guistate.openFilterView(selectedPreset.layer)}}>
                <ToSvelte construct={Svg.layers_svg().SetClass("w-12")}/>
                <Tr t={Translations.t.general.add.openLayerControl}/>
            </button>
        </div>

    {:else if !confirmedCategory  }
        <!-- Second, confirm the category -->
        <h2>
            <Tr t={Translations.t.general.add.confirmTitle.Subs({title: selectedPreset.preset.title})}/>
        </h2>

        <Tr t={Translations.t.general.add.confirmIntro}/>


        {#if selectedPreset.preset.description}
            <Tr t={selectedPreset.preset.description}/>
        {/if}

        {#if selectedPreset.preset.exampleImages}
            <h3>
                {#if selectedPreset.preset.exampleImages.length === 1}
                    <Tr t={Translations.t.general.example}/>
                {:else}
                    <Tr t={Translations.t.general.examples }/>
                {/if}
            </h3>
            <span class="flex flex-wrap items-stretch">
      {#each selectedPreset.preset.exampleImages as src}
        <img {src} class="h-64 m-1 w-auto rounded-lg">
      {/each}
      </span>
        {/if}
        <TagHint embedIn={tags => t.presetInfo.Subs({tags})} {state}
                 tags={new And(selectedPreset.preset.tags)}></TagHint>

        <div class="flex w-full flex-wrap-reverse md:flex-nowrap">

            <BackButton on:click={() => selectedPreset = undefined} clss="w-full">
                <Tr slot="message" t={t.backToSelect}/>
            </BackButton>

            <NextButton on:click={() => confirmedCategory = true} clss="primary w-full">
                <div slot="image" class="relative">
                    <FromHtml src={selectedPreset.icon}></FromHtml>
                    <img class="absolute bottom-0 right-0 w-4 h-4" src="./assets/svg/confirm.svg">
                </div>
                <div class="w-full">
                    <Tr t={selectedPreset.text}></Tr>
                </div>
            </NextButton>
        </div>

    {:else if _globalFilter?.length > 0 && _globalFilter?.length > checkedOfGlobalFilters}
        <Tr t={_globalFilter[checkedOfGlobalFilters].onNewPoint?.safetyCheck}/>
        <SubtleButton on:click={() => {checkedOfGlobalFilters = checkedOfGlobalFilters + 1}}>
            <img slot="image" src={_globalFilter[checkedOfGlobalFilters].onNewPoint?.icon ?? "./assets/svg/confirm.svg"}
                 class="w-12 h-12">
            <Tr slot="message"
                t={_globalFilter[checkedOfGlobalFilters].onNewPoint?.confirmAddNew.Subs({preset: selectedPreset.preset})}/>
        </SubtleButton>
        <SubtleButton on:click={() => {globalFilter.setData([]); abort()}}>
            <img slot="image" src="./assets/svg/close.svg" class="w-8 h-8"/>
            <Tr slot="message" t={Translations.t.general.cancel}/>
        </SubtleButton>
    {:else if !creating}
        <NewPointLocationInput value={preciseCoordinate} snappedTo={snappedToObject} {state} {coordinate}
                               targetLayer={selectedPreset.layer}
                               snapToLayers={selectedPreset.preset.preciseInput.snapToLayers}/>
        <div class="flex flex-wrap-reverse md:flex-nowrap">

            <BackButton on:click={() => selectedPreset = undefined} clss="w-full">
                <Tr slot="message" t={t.backToSelect}/>
            </BackButton>

            <NextButton on:click={confirm} clss="primary w-full">
                <div class="w-full flex justify-end gap-x-2">
                    <Tr t={Translations.t.general.add.confirmLocation}/>
                </div>
            </NextButton>
        </div>
    {:else}
        <Loading>Creating point...</Loading>
    {/if}
</LoginToggle>
