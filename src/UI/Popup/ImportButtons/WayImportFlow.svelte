<script lang="ts">
  /**
   * Can be used for both WayImportFlow and ConflateImportFlow
   */
  import WayImportFlowState from "./WayImportFlowState"
  import ImportFlow from "./ImportFlow.svelte"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import { MapLibreAdaptor } from "../../Map/MapLibreAdaptor"
  import MaplibreMap from "../../Map/MaplibreMap.svelte"
  import ShowDataLayer from "../../Map/ShowDataLayer"
  import StaticFeatureSource from "../../../Logic/FeatureSource/Sources/StaticFeatureSource"
  import { ImportFlowUtils } from "./ImportFlow"
  import { GeoOperations } from "../../../Logic/GeoOperations"
  import ConflateImportFlowState from "./ConflateImportFlowState"
  import OpenBackgroundSelectorButton from "../../BigComponents/OpenBackgroundSelectorButton.svelte"

  export let importFlow: WayImportFlowState | ConflateImportFlowState

  const state = importFlow.state
  const map = new UIEventSource<MlMap>(undefined)
  const [lon, lat] = GeoOperations.centerpointCoordinates(importFlow.originalFeature)
  const mla = new MapLibreAdaptor(map, {
    allowMoving: UIEventSource.feedFrom(state.featureSwitchIsTesting),
    allowZooming: UIEventSource.feedFrom(state.featureSwitchIsTesting),
    rasterLayer: state.mapProperties.rasterLayer,
    location: new UIEventSource<{ lon: number; lat: number }>({ lon, lat }),
    zoom: new UIEventSource<number>(18),
  })

  // Show all relevant data - including (eventually) the way of which the geometry will be replaced
  ShowDataLayer.showMultipleLayers(
    map,
    new StaticFeatureSource([importFlow.originalFeature]),
    state.layout.layers,
    { zoomToFeatures: false }
  )

  importFlow.GetPreview().then((features) => {
    new ShowDataLayer(map, {
      zoomToFeatures: false,
      features,
      layer: ImportFlowUtils.conflationLayer,
    })
  })
</script>

<ImportFlow {importFlow} on:confirm={() => importFlow.onConfirm()}>
  <div slot="map" class="relative">
    <div class="h-32">
      <MaplibreMap {map} mapProperties={mla} />
    </div>
    <div class="absolute bottom-0">
      <OpenBackgroundSelectorButton {state} {map} />
    </div>
  </div>
</ImportFlow>
