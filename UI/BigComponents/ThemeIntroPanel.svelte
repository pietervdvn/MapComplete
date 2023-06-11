<script lang="ts">
    import Translations from "../i18n/Translations";
    import Svg from "../../Svg";
    import Tr from "../Base/Tr.svelte";
    import NextButton from "../Base/NextButton.svelte";
    import Geosearch from "./Geosearch.svelte";
    import IfNot from "../Base/IfNot.svelte";
    import ToSvelte from "../Base/ToSvelte.svelte";
    import ThemeViewState from "../../Models/ThemeViewState";
    import If from "../Base/If.svelte";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import {SearchIcon} from "@rgossiaux/svelte-heroicons/solid";

    /**
     * The theme introduction panel
     */
    export let state: ThemeViewState
    let layout = state.layout
    let selectedElement = state.selectedElement
    let selectedLayer = state.selectedLayer


    let triggerSearch: UIEventSource<any> = new UIEventSource<any>(undefined)
    let searchEnabled = false

    function jumpToCurrentLocation() {
        const glstate = state.geolocation.geolocationState
        if (glstate.currentGPSLocation.data !== undefined) {
            const c: GeolocationCoordinates = glstate.currentGPSLocation.data
            state.guistate.themeIsOpened.setData(false)
            const coor = {lon: c.longitude, lat: c.latitude}
            state.mapProperties.location.setData(coor)
        }
        if (glstate.permission.data !== "granted") {
            glstate.requestPermission()
            return
        }

    }

</script>

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
<NextButton clss="primary w-full" on:click={() => state.guistate.themeIsOpened.setData(false)}>
    <div class="flex justify-center w-full text-2xl">
        <Tr t={Translations.t.general.openTheMap}/>
    </div>
</NextButton>

<div class="flex w-full flex-wrap sm:flex-nowrap">
    <IfNot condition={state.geolocation.geolocationState.permission.map(p => p === "denied")}>
        <button class="flex w-full gap-x-2 items-center" on:click={jumpToCurrentLocation}>
            <ToSvelte construct={Svg.crosshair_svg().SetClass("w-8 h-8")}/>
            <Tr t={Translations.t.general.openTheMapAtGeolocation}/>
        </button>
    </IfNot>

    <div class="flex gap-x-2 items-center w-full border rounded .button p-2 m-1 low-interaction">
        <div class="w-full">
            <Geosearch bounds={state.mapProperties.bounds}
                       on:searchCompleted={() => state.guistate.themeIsOpened.setData(false)}
                       on:searchIsValid={isValid => {searchEnabled=  isValid}}
                       perLayer={state.perLayer}
                       {selectedElement}
                       {selectedLayer}
                       {triggerSearch}>
            </Geosearch>
        </div>
        <button class={"flex gap-x-2 justify-between items-center "+(searchEnabled ? "" : "disabled")}
                on:click={() => triggerSearch.ping()}>
            <Tr t={Translations.t.general.search.searchShort}/>
            <SearchIcon class="w-6 h-6"></SearchIcon>
        </button>

    </div>
</div>
