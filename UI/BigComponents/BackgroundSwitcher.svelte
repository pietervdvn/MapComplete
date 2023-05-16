<script lang="ts">
    import {Store, UIEventSource} from "../../Logic/UIEventSource";
    import type {RasterLayerPolygon} from "../../Models/RasterLayers";
    import {AvailableRasterLayers} from "../../Models/RasterLayers";
    import Tr from "../Base/Tr.svelte";
    import {onDestroy} from "svelte";
    import Translations from "../i18n/Translations";
    import Svg from "../../Svg";
    import {Map as MlMap} from "maplibre-gl"
    import MaplibreMap from "../Map/MaplibreMap.svelte";
    import {MapLibreAdaptor} from "../Map/MapLibreAdaptor";
    import type {MapProperties} from "../../Models/MapProperties";

    export let mapproperties: MapProperties
    export let normalMap: UIEventSource<MlMap>
    /**
     * The current background (raster) layer of the polygon.
     * This is undefined if a vector layer is used
     */
    let rasterLayer: UIEventSource<RasterLayerPolygon | undefined> = mapproperties.rasterLayer
    let name = rasterLayer.data?.properties?.name
    let icon = Svg.satellite_svg()
    onDestroy(rasterLayer.addCallback(polygon => {
        name = polygon.properties?.name
    }))
    /**
     * The layers that this component can offer as a choice.
     */
    export let availableRasterLayers: Store<RasterLayerPolygon[]>

    let altmap: UIEventSource<MlMap> = new UIEventSource(undefined)
    let altproperties = new MapLibreAdaptor(altmap, {zoom: UIEventSource.feedFrom(mapproperties.zoom)})
    altproperties.allowMoving.setData(false)
    altproperties.allowZooming.setData(false)
    let altmap0: UIEventSource<MlMap> = new UIEventSource(undefined)
    let altproperties0 = new MapLibreAdaptor(altmap0, {zoom: altproperties.zoom})
  //  altproperties0.allowMoving.setData(false)
   // altproperties0.allowZooming.setData(false)

    function updatedAltLayer() {
        const available = availableRasterLayers.data
        const current = rasterLayer.data
        const defaultLayer = AvailableRasterLayers.maplibre
        const firstOther = available.find(l => l !== current && l !== defaultLayer)

        altproperties.rasterLayer.setData(firstOther)
        const secondOther = available.find(l => l !== current && l !== firstOther && l !== defaultLayer)
        altproperties0.rasterLayer.setData(secondOther)

    }

    onDestroy(availableRasterLayers.addCallbackAndRunD(updatedAltLayer))
    onDestroy(rasterLayer.addCallbackAndRunD(updatedAltLayer))

    function pixelCenterOf(map: UIEventSource<MlMap>): [number, number] {
        const rect = map?.data?.getCanvas()?.getBoundingClientRect()
        if (!rect) {
            return undefined
        }
        const x = (rect.left + rect.right) / 2
        const y = (rect.top + rect.bottom) / 2
        return [x, y]
    }

    mapproperties.location.addCallbackAndRunD(({lon, lat}) => {
        if (!normalMap.data || !altmap.data) {
            return
        }
        const altMapCenter = pixelCenterOf(altmap)
        const c = normalMap.data.unproject(altMapCenter)
        altproperties.location.setData({lon: c.lng, lat: c.lat})

        const altMapCenter0 = pixelCenterOf(altmap0)
        const c0 = normalMap.data.unproject(altMapCenter0)
        altproperties0.location.setData({lon: c0.lng, lat: c0.lat})
    })

</script>
<div class="flex">
    <div class="w-32 h-32 overflow-hidden border-interactive">
        <MaplibreMap map={altmap}/>
    </div>
    <div class="w-32 h-32 overflow-hidden border-interactive">
        <MaplibreMap map={altmap0}/>
    </div>
    <div class="low-interaction flex flex-col">
        <b>Current background:</b>
        <Tr t={Translations.T(name)}/>
    </div>
</div>
