<script lang="ts">
  /**
   * This component shows a map which focuses on a single OSM-Way (linestring) feature.
   * Clicking the map will add a new 'scissor' point, projected on the linestring (and possible snapped to an already existing node within the linestring;
   * clicking this point again will remove it.
   * The bound 'value' will contain the location of these projected points.
   * Points are not coalesced with already existing nodes within the way; it is up to the code actually splitting the way to decide to reuse an existing point or not
   *
   * This component is _not_ responsible for the rest of the flow, e.g. the confirm button
   */
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
  import split_point from "../../../assets/layers/split_point/split_point.json"
  import split_road from "../../../assets/layers/split_road/split_road.json"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import type { MapProperties } from "../../Models/MapProperties"
  import { MapLibreAdaptor } from "../Map/MapLibreAdaptor"
  import MaplibreMap from "../Map/MaplibreMap.svelte"
  import { OsmWay } from "../../Logic/Osm/OsmObject"
  import ShowDataLayer from "../Map/ShowDataLayer"
  import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import { BBox } from "../../Logic/BBox"
  import type { Feature, LineString, Point } from "geojson"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import SmallZoomButtons from "../Map/SmallZoomButtons.svelte"

  const splitpoint_style = new LayerConfig(
    <LayerConfigJson>split_point,
    "(BUILTIN) SplitRoadWizard.ts",
    true
  )

  const splitroad_style = new LayerConfig(
    <LayerConfigJson>split_road,
    "(BUILTIN) SplitRoadWizard.ts",
    true
  )

  /**
   * The way to focus on
   */
  export let osmWay: OsmWay
  /**
   * How to render this layer.
   * A default is given
   */
  export let layer: LayerConfig = splitroad_style
  export let state: SpecialVisualizationState | undefined = undefined
  /**
   * Optional: use these properties to set e.g. background layer
   */
  export let mapProperties: undefined | Partial<MapProperties> = undefined

  /**
   * Reuse a point if the clicked location is within this amount of meter
   */
  export let  snapTolerance: number = 5

  let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
  let adaptor = new MapLibreAdaptor(map, mapProperties)

  let wayGeojson: Feature<LineString> = GeoOperations.forceLineString(osmWay.asGeoJson())
  adaptor.location.setData(GeoOperations.centerpointCoordinatesObj(wayGeojson))
  adaptor.bounds.setData(BBox.get(wayGeojson).pad(2))
  adaptor.maxbounds.setData(BBox.get(wayGeojson).pad(2))

  state?.showCurrentLocationOn(map)
  new ShowDataLayer(map, {
    features: new StaticFeatureSource([wayGeojson]),
    drawMarkers: true,
    layer: layer,
  })

  export let splitPoints: UIEventSource<
    Feature<
      Point,
      {
        id: number
        index: number
        dist: number
        location: number
      }
    >[]
  > = new UIEventSource([])
  const splitPointsFS = new StaticFeatureSource(splitPoints)

  new ShowDataLayer(map, {
    layer: splitpoint_style,
    features: splitPointsFS,
    onClick: (clickedFeature: Feature) => {
      // A 'splitpoint' was clicked, so we remove it again
      const i = splitPoints.data.findIndex((f) => f.properties.id === clickedFeature.properties.id)
      if (i < 0) {
        return
      }
      splitPoints.data.splice(i, 1)
      splitPoints.ping()
    },
  })
  let id = 0
  adaptor.lastClickLocation.addCallbackD(({ lon, lat }) => {
    let projected: Feature<Point, {index:number, id?: number, reuse?: string}> = GeoOperations.nearestPoint(wayGeojson, [lon, lat])

    console.log("Added splitpoint", projected, id)

    // We check the next and the previous point. If those are closer then the tolerance, we reuse those instead

    const i = projected.properties.index
    const p = projected.geometry.coordinates
    const way = wayGeojson.geometry.coordinates
    const nextPoint = <[number,number]> way[i + 1]
    const nextDistance = GeoOperations.distanceBetween(nextPoint, p)
    const previousPoint = <[number,number]> way[i]
    const previousDistance = GeoOperations.distanceBetween(previousPoint, p)

    console.log("ND", nextDistance, "PD", previousDistance)
    if(nextDistance <= snapTolerance && previousDistance >= nextDistance){
      projected = {
        type:"Feature",
        geometry: {
          type:"Point",
          coordinates: nextPoint
        },
        properties: {
          index: i+1,
          reuse: "yes"
        }
      }
    }
    if (previousDistance <= snapTolerance && previousDistance < nextDistance){
      projected = {
        type:"Feature",
        geometry: {
          type:"Point",
          coordinates: previousPoint
        },
        properties: {
          index: i,
          reuse: "yes"
        }
      }
    }

    projected.properties["id"] = id
    id++
    splitPoints.data.push(<any>projected)
    splitPoints.ping()
  })
</script>

<div class="relative h-full w-full">
  <MaplibreMap {map} mapProperties={adaptor} />
  <SmallZoomButtons {adaptor} />
</div>
