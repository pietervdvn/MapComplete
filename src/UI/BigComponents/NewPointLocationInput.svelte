<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LocationInput from "../InputElement/Helpers/LocationInput.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { Tiles } from "../../Models/TileRange"
  import { Map as MlMap } from "maplibre-gl"
  import { BBox } from "../../Logic/BBox"
  import type { MapProperties } from "../../Models/MapProperties"
  import ShowDataLayer from "../Map/ShowDataLayer"
  import type {
    FeatureSource,
    FeatureSourceForLayer,
  } from "../../Logic/FeatureSource/FeatureSource"
  import SnappingFeatureSource from "../../Logic/FeatureSource/Sources/SnappingFeatureSource"
  import FeatureSourceMerger from "../../Logic/FeatureSource/Sources/FeatureSourceMerger"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import { Utils } from "../../Utils"
  import { createEventDispatcher } from "svelte"
  import Move_arrows from "../../assets/svg/Move_arrows.svelte"

  /**
   * An advanced location input, which has support to:
   * - Show more layers
   * - Snap to layers
   *
   * This one is mostly used to insert new points, including when importing
   */
  export let state: SpecialVisualizationState
  /**
   * The start coordinate
   */
  export let coordinate: { lon: number; lat: number }

  /**
   * The center of the map at all times
   * If undefined at the beginning, 'coordinate' will be used
   */
  export let value: UIEventSource<{ lon: number; lat: number }>
  if (value.data === undefined) {
    value.setData(coordinate)
  }
  if (coordinate === undefined) {
    coordinate = value.data
  }
  export let snapToLayers: string[] | undefined
  export let targetLayer: LayerConfig | undefined
  export let maxSnapDistance: number = undefined

  export let snappedTo: UIEventSource<string | undefined>

  let preciseLocation: UIEventSource<{ lon: number; lat: number }> = new UIEventSource<{
    lon: number
    lat: number
  }>(undefined)

  const dispatch = createEventDispatcher<{ click: { lon: number; lat: number } }>()

  const xyz = Tiles.embedded_tile(coordinate.lat, coordinate.lon, 16)
  const map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
  let initialMapProperties: Partial<MapProperties> & { location } = {
    zoom: new UIEventSource<number>(19),
    maxbounds: new UIEventSource(undefined),
    /*If no snapping needed: the value is simply the map location;
     * If snapping is needed: the value will be set later on by the snapping feature source
     * */
    location:
      snapToLayers?.length > 0
        ? new UIEventSource<{ lon: number; lat: number }>(coordinate)
        : value,
    bounds: new UIEventSource<BBox>(undefined),
    allowMoving: new UIEventSource<boolean>(true),
    allowZooming: new UIEventSource<boolean>(true),
    minzoom: new UIEventSource<number>(18),
    rasterLayer: UIEventSource.feedFrom(state.mapProperties.rasterLayer),
  }

  if (targetLayer) {
    const featuresForLayer = state.perLayer.get(targetLayer.id)
    if (featuresForLayer) {
      new ShowDataLayer(map, {
        layer: targetLayer,
        features: featuresForLayer,
      })
    }
  }

  if (snapToLayers?.length > 0) {
    const snapSources: FeatureSource[] = []
    for (const layerId of snapToLayers ?? []) {
      const layer: FeatureSourceForLayer = state.perLayer.get(layerId)
      snapSources.push(layer)
      if (layer.features === undefined) {
        continue
      }
      new ShowDataLayer(map, {
        layer: layer.layer.layerDef,
        zoomToFeatures: false,
        features: layer,
      })
    }
    const snappedLocation = new SnappingFeatureSource(
      new FeatureSourceMerger(...Utils.NoNull(snapSources)),
      // We snap to the (constantly updating) map location
      initialMapProperties.location,
      {
        maxDistance: maxSnapDistance ?? 15,
        allowUnsnapped: true,
        snappedTo,
        snapLocation: value,
      }
    )

    new ShowDataLayer(map, {
      layer: targetLayer,
      features: snappedLocation,
    })
  }
</script>

<LocationInput
  {map}
  on:click={(data) => dispatch("click", data)}
  mapProperties={initialMapProperties}
  value={preciseLocation}
  initialCoordinate={coordinate}
  maxDistanceInMeters={50}
>
  <slot name="image" slot="image">
    <Move_arrows class="h-full max-h-24" />
  </slot>
</LocationInput>
