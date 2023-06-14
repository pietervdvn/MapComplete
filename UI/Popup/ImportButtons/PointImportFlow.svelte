<script lang="ts">
  import ImportFlow from "./ImportFlow.svelte"
  import { PointImportFlowState } from "./PointImportFlowState"
  import NewPointLocationInput from "../../BigComponents/NewPointLocationInput.svelte"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import MapControlButton from "../../Base/MapControlButton.svelte"
  import { Square3Stack3dIcon } from "@babeard/svelte-heroicons/solid"

  export let importFlow: PointImportFlowState

  const state = importFlow.state

  const args = importFlow.args

  // The following variables are used for the map
  const targetLayer: LayerConfig = state.layout.layers.find((l) => l.id === args.targetLayer)
  const snapToLayers: string[] | undefined =
    args.snap_onto_layers?.split(",")?.map((l) => l.trim()) ?? []
  const maxSnapDistance: number = Number(args.max_snap_distance ?? 25) ?? 25

  const snappedTo: UIEventSource<string | undefined> = new UIEventSource<string | undefined>(
    undefined
  )

  const startCoordinate = {
    lon: importFlow.startCoordinate[0],
    lat: importFlow.startCoordinate[1],
  }
  const value: UIEventSource<{ lon: number; lat: number }> = new UIEventSource<{
    lon: number
    lat: number
  }>(startCoordinate)

  async function onConfirm(): Promise<void> {
    const importedId = await importFlow.onConfirm(value.data, snappedTo.data)
    state.selectedLayer.setData(targetLayer)
    state.selectedElement.setData(state.indexedFeatures.featuresById.data.get(importedId))
  }
</script>

<ImportFlow {importFlow} on:confirm={onConfirm}>
  <div class="relative" slot="map">
    <div class="h-32">
      <NewPointLocationInput
        coordinate={startCoordinate}
        {maxSnapDistance}
        {snapToLayers}
        {snappedTo}
        {state}
        {targetLayer}
        {value}
      />
    </div>
    <MapControlButton
      on:click={() => state.guistate.backgroundLayerSelectionIsOpened.setData(true)}
      cls="absolute bottom-0"
    >
      <Square3Stack3dIcon class="h-6 w-6" />
    </MapControlButton>
  </div>
</ImportFlow>
