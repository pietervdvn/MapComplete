<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LocationInput from "../InputElement/Helpers/LocationInput.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
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
  import Move_arrows from "../../assets/svg/Move_arrows.svelte"
  import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
  import { Tag } from "../../Logic/Tags/Tag"
  import { TagUtils } from "../../Logic/Tags/TagUtils"
  import type { WayId } from "../../Models/OsmFeature"

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
  export let coordinate: { lon: number; lat: number } = undefined

  /**
   * Max distance that one is allowed to move, to prevent to stray too much
   */
  export let maxDistanceInMeters = 50

  /**
   * The resulting location; either the map center or the snapped coordinate
   * If undefined at the beginning, 'coordinate' will be used
   */
  export let value: UIEventSource<{ lon: number; lat: number }>
  if (value.data === undefined) {
    value.setData(coordinate)
  }
  if (coordinate === undefined) {
    coordinate = value.data
  }
  export let snapToLayers: string[] | undefined = undefined
  export let targetLayer: LayerConfig | undefined = undefined
  /**
   * If a 'targetLayer' is given, objects of this layer will be shown as well to avoid duplicates
   * If you want to hide some of them, blacklist them here
   */
  export let dontShow: string[] = []
  export let maxSnapDistance: number = undefined
  export let presetProperties: Tag[] = []
  let presetPropertiesUnpacked = TagUtils.KVtoProperties(presetProperties)

  export let snappedTo: UIEventSource<WayId | undefined>

  const map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
  export let mapProperties: Partial<MapProperties> & { location } = {
    zoom: new UIEventSource<number>(19),
    maxbounds: new UIEventSource(undefined),
    /*If no snapping needed: the value is simply the map location;
     * If snapping is needed: the value will be set later on by the snapping feature source
     * */
    location: new UIEventSource<{ lon: number; lat: number }>(coordinate),
    bounds: new UIEventSource<BBox>(undefined),
    allowMoving: new UIEventSource<boolean>(true),
    allowZooming: new UIEventSource<boolean>(true),
    minzoom: new UIEventSource<number>(18),
    rasterLayer: UIEventSource.feedFrom(state.mapProperties.rasterLayer),
  }
  state?.showCurrentLocationOn(map)

  if (targetLayer) {
    // Show already existing items
    let featuresForLayer: FeatureSource = state.perLayer.get(targetLayer.id)
    if (featuresForLayer) {
      if (dontShow) {
        featuresForLayer = new StaticFeatureSource(featuresForLayer.features.map(feats => feats.filter(f => dontShow.indexOf(f.properties.id) < 0)))
      }
      new ShowDataLayer(map, {
        layer: targetLayer,
        features: featuresForLayer,
      })
    }
  }

  if (snapToLayers?.length > 0) {
    const snapSources: FeatureSource[] = []
    for (const layerId of snapToLayers ?? []) {
      // We assume that the layer contains the data, as the OSM-API-Feature-source should have loaded them, even though the layer might not be displayed
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
      mapProperties.location,
      {
        maxDistance: maxSnapDistance ?? 15,
        allowUnsnapped: true,
        snappedTo,
        snapLocation: value,
      },
    )
    const withCorrectedAttributes = new StaticFeatureSource(
      snappedLocation.features.mapD((feats) =>
        feats.map((f) => {
          const properties = {
            ...f.properties,
            ...presetPropertiesUnpacked,
          }
          properties["_referencing_ways"] = f.properties["snapped-to"]
          return {
            ...f,
            properties,
          }
        }),
      ),
    )
    // The actual point to be created, snapped at the new location
    new ShowDataLayer(map, {
      layer: targetLayer,
      features: withCorrectedAttributes,
    })
    withCorrectedAttributes.features.addCallbackAndRunD((f) => console.log("Snapped point is", f))
  }

</script>

<LocationInput
  {map}
  on:click
  {mapProperties}
  value={ snapToLayers?.length > 0 ? new UIEventSource(undefined) : value}
  initialCoordinate={coordinate}
  {maxDistanceInMeters}
>
  <slot name="image" slot="image">
    <Move_arrows class="h-full max-h-24" />
  </slot>
</LocationInput>
