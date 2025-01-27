<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import { MapLibreAdaptor } from "../Map/MapLibreAdaptor"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import ShowDataLayer from "../Map/ShowDataLayer"
  import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
  import MaplibreMap from "../Map/MaplibreMap.svelte"
  import Loading from "../Base/Loading.svelte"
  import { Utils } from "../../Utils"
  import DelayedComponent from "../Base/DelayedComponent.svelte"

  export let state: SpecialVisualizationState
  export let tagSource: UIEventSource<Record<string, string>>
  export let args: string[]
  export let feature: Feature

  const keys = [...args]
  keys.splice(0, 1)
  let featuresToShow: Store<Feature[]> = state.indexedFeatures.featuresById.map(
    (featuresById) => {
      if (featuresById === undefined) {
        return []
      }
      const properties = tagSource.data
      const features: Feature[] = []
      for (const key of keys) {
        const value = properties[key]
        if (value === undefined || value === null) {
          continue
        }

        let idList = [value]
        if (Array.isArray(value)) {
          idList = value
        } else if (key !== "id" && typeof value === "string" && value?.startsWith("[")) {
          // This is a list of values
          idList = JSON.parse(value)
        }

        for (const id of idList) {
          const feature = featuresById.get(id)
          if (feature === undefined) {
            console.warn("No feature found for id ", id)
            continue
          }
          features.push(feature)
        }
      }
      return features
    },
    [tagSource]
  )

  let mlmap = new UIEventSource(undefined)
  let [lon, lat] = GeoOperations.centerpointCoordinates(feature)
  let mla = new MapLibreAdaptor(mlmap, {
    rasterLayer: state.mapProperties.rasterLayer,
    zoom: new UIEventSource<number>(17),
    maxzoom: new UIEventSource<number>(17),
  })

  mla.allowMoving.setData(false)
  mla.allowZooming.setData(false)
  mla.location.setData({ lon, lat })

  if (args[0]) {
    const parsed = Number(args[0])
    if (!isNaN(parsed) && parsed > 0 && parsed < 25) {
      mla.zoom.setData(parsed)
    }
  }

  ShowDataLayer.showMultipleLayers(
    mlmap,
    new StaticFeatureSource(featuresToShow),
    state.theme.layers,
    { zoomToFeatures: true }
  )
</script>

<div class="h-40 rounded" style="overflow: hidden; pointer-events: none;">
  <DelayedComponent>
    <MaplibreMap interactive={false} map={mlmap} mapProperties={mla} />
  </DelayedComponent>
</div>
