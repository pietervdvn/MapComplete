<script lang="ts">

    import type {SpecialVisualizationState} from "../SpecialVisualization";
    import {ArrowDownTrayIcon} from "@babeard/svelte-heroicons/mini";
    import Tr from "../Base/Tr.svelte";
    import Translations from "../i18n/Translations";
    import type {FeatureCollection} from "geojson";
    import Loading from "../Base/Loading.svelte";
    import {Translation} from "../i18n/Translation";
    import DownloadHelper from "./DownloadHelper";
    import {Utils} from "../../Utils";
    import type {PriviligedLayerType} from "../../Models/Constants";

    export let state: SpecialVisualizationState

    export let extension: string
    export let mimetype: string
    export let construct: (geojsonCleaned: FeatureCollection) => (Blob | string) | Promise<void>
    export let mainText: Translation
    export let helperText: Translation
    export let metaIsIncluded: boolean
    let downloadHelper: DownloadHelper = new DownloadHelper(state)

    const t = Translations.t.general.download

    let isExporting = false
    let isError = false

    async function clicked() {
        isExporting = true
        const gpsLayer = state.layerState.filteredLayers.get(
            <PriviligedLayerType>"gps_location"
        )
        state.lastClickObject.features.setData([])
        
        const gpsIsDisplayed = gpsLayer.isDisplayed.data
        try {
            gpsLayer.isDisplayed.setData(false)
            const geojson: FeatureCollection = downloadHelper.getCleanGeoJson(metaIsIncluded)
            const name = state.layout.id

            const promise = construct(geojson)
            let data: Blob | string
            if (typeof promise === "string") {
                data = promise
            } else if (typeof promise["then"] === "function") {
                data = await <Promise<Blob | string>> promise
            } else {
                data = <Blob>promise
            }
            console.log("Got data", data)
            Utils.offerContentsAsDownloadableFile(
                data,
                `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.${extension}`,
                {
                    mimetype,
                }
            )
        } catch (e) {
            isError = true
        }
        gpsLayer.isDisplayed.setData(gpsIsDisplayed)

        isExporting = false
    }

</script>

{#if isError}
    <Tr cls="alert" t={Translations.t.error}/>
{:else if isExporting}
    <Loading>
        <Tr t={t.exporting}/>
    </Loading>
{:else}
    <button class="flex w-full" on:click={clicked}>
        <slot name="image">
            <ArrowDownTrayIcon class="w-12 h-12 mr-2"/>
        </slot>
        <span class="flex flex-col items-start">
            <Tr t={mainText}/>
            <Tr t={helperText} cls="subtle"/>
        </span>
    </button>
{/if}
