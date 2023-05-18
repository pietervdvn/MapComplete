<script lang="ts">
    import type {RasterLayerPolygon} from "../../Models/RasterLayers";
    import OverlayMap from "./OverlayMap.svelte";
    import type {MapProperties} from "../../Models/MapProperties";
    import {Store, UIEventSource} from "../../Logic/UIEventSource";
    import {Map as MlMap} from "maplibre-gl"
    import {createEventDispatcher, onDestroy} from "svelte";

    /***
     * Chooses a background-layer out of available options
     */
    export let availableLayers: Store<RasterLayerPolygon[]>
    export let mapproperties: MapProperties
    export let map: Store<MlMap>

    export let visible: Store<boolean> = undefined
    
    let dispatch = createEventDispatcher<{appliedLayer}>()
    
    export let favourite : UIEventSource<string> = undefined
    

    let rasterLayer = new UIEventSource<RasterLayerPolygon>(availableLayers.data?.[0])
    let hasLayers = true
    onDestroy(availableLayers.addCallbackAndRun(layers => {
        if (layers === undefined || layers.length === 0) {
            hasLayers = false
            return
        }
        hasLayers = true
        rasterLayer.setData(layers[0])
    }))
    
    if(favourite){
        onDestroy(favourite.addCallbackAndRunD(favourite => {
            const fav = availableLayers.data?.find(l => l.properties.id === favourite)
            if(!fav){
                return
            }
            rasterLayer.setData(fav)
        }))
    }
    
    onDestroy(rasterLayer.addCallbackAndRunD(selected => {
        favourite?.setData(selected.properties.id)
    }))

    let rasterLayerOnMap = UIEventSource.feedFrom(rasterLayer)
    
    if (visible) {
        onDestroy(visible?.addCallbackAndRunD(visible => {
            if (visible) {
                rasterLayerOnMap.setData(rasterLayer.data ?? availableLayers.data[0])
            } else {
                rasterLayerOnMap.setData(undefined)
            }
        }))
    }
</script>

{#if hasLayers}
    <div class="h-full w-full flex flex-col">
        <button on:click={() => {mapproperties.rasterLayer.setData(rasterLayer.data);
            dispatch("appliedLayer")
        }} class="w-full h-full m-0 p-0">
            <OverlayMap rasterLayer={rasterLayerOnMap} placedOverMap={map} placedOverMapProperties={mapproperties}
                        {visible}/>
        </button>
        <select bind:value={$rasterLayer} class="w-full">
            {#each $availableLayers as availableLayer }
                <option value={availableLayer}>
                    {availableLayer.properties.name}
                </option>
            {/each}
        </select>
    </div>
{/if}
