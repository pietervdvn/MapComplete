<script lang="ts">
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import type { MapProperties } from "../../../Models/MapProperties"
  import { Map as MlMap } from "maplibre-gl"
  import { MapLibreAdaptor } from "../../Map/MapLibreAdaptor"
  import MaplibreMap from "../../Map/MaplibreMap.svelte"
  import DragInvitation from "../../Base/DragInvitation.svelte"
  import { GeoOperations } from "../../../Logic/GeoOperations"
  import ShowDataLayer from "../../Map/ShowDataLayer"
  import * as boundsdisplay from "../../../../assets/layers/range/range.json"
  import StaticFeatureSource from "../../../Logic/FeatureSource/Sources/StaticFeatureSource"
  import * as turf from "@turf/turf"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { createEventDispatcher, onDestroy } from "svelte"
  import Move_arrows from "../../../assets/svg/Move_arrows.svelte"
  import SmallZoomButtons from "../../Map/SmallZoomButtons.svelte"

  /**
   * A visualisation to pick a location on a map background
   */
  export let value: UIEventSource<{ lon: number; lat: number }>
  export let initialCoordinate: { lon: number; lat: number }
  initialCoordinate = initialCoordinate ?? value.data
  export let maxDistanceInMeters: number = undefined
  export let mapProperties: Partial<MapProperties> & {
    readonly location: UIEventSource<{ lon: number; lat: number }>
  } = undefined
  /**
   * Called when setup is done, can be used to add more layers to the map
   */
  export let onCreated: (
    value: Store<{
      lon: number
      lat: number
    }>,
    map: Store<MlMap>,
    mapProperties: MapProperties
  ) => void = undefined

  const dispatch = createEventDispatcher<{ click: { lon: number; lat: number } }>()

  export let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
  let mla = new MapLibreAdaptor(map, mapProperties)
  mla.lastClickLocation.addCallbackAndRunD((lastClick) => {
    dispatch("click", lastClick)
  })
  mapProperties.location.syncWith(value)
  if (onCreated) {
    onCreated(value, map, mla)
  }

  let rangeIsShown = false
  if (maxDistanceInMeters) {
    onDestroy(
      mla.location.addCallbackD((newLocation) => {
        const l: [number, number] = [newLocation.lon, newLocation.lat]
        const c: [number, number] = [initialCoordinate.lon, initialCoordinate.lat]
        const d = GeoOperations.distanceBetween(l, c)
        if (d <= maxDistanceInMeters) {
          return
        }
        // This is too far away - let's move back
        const correctLocation = GeoOperations.along(c, l, maxDistanceInMeters - 10)
        window.setTimeout(() => {
          mla.location.setData({ lon: correctLocation[0], lat: correctLocation[1] })
        }, 25)

        if (!rangeIsShown) {
          new ShowDataLayer(map, {
            layer: new LayerConfig(<any>boundsdisplay),
            features: new StaticFeatureSource([
              turf.circle(c, maxDistanceInMeters, {
                units: "meters",
                properties: { range: "yes", id: "0" },
              }),
            ]),
          })
          rangeIsShown = true
        }
      })
    )
  }
</script>

<div class="min-h-32 relative h-full cursor-pointer overflow-hidden">
  <div class="absolute top-0 left-0 h-full w-full cursor-pointer">
    <MaplibreMap
      center={{ lng: initialCoordinate.lon, lat: initialCoordinate.lat }}
      {map}
      mapProperties={mla}
    />
  </div>

  <div
    class="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center p-8 opacity-50"
  >
    <slot name="image">
      <Move_arrows class="h-full max-h-24" />
    </slot>
  </div>

  <DragInvitation hideSignal={mla.location} />
  <SmallZoomButtons adaptor={mla} />
</div>
