<script lang="ts">
  import ImportFlow from "./ImportFlow.svelte"
  import { PointImportFlowState } from "./PointImportFlowState"
  import NewPointLocationInput from "../../BigComponents/NewPointLocationInput.svelte"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import OpenBackgroundSelectorButton from "../../BigComponents/OpenBackgroundSelectorButton.svelte"

  export let importFlow: PointImportFlowState

  const state = importFlow.state

  const args = importFlow.args

  // The following variables are used for the map
  const targetLayers: LayerConfig[] = args.targetLayer
    .split(" ")
    .map((tl) => state.layout.layers.find((l) => l.id === tl))
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
    state.selectedElement.setData(state.indexedFeatures.featuresById.data.get(importedId))
  }
</script>

<ImportFlow {importFlow} on:confirm={onConfirm}>
  <div class="relative" slot="map">
    <div class="h-64">
      <NewPointLocationInput
        coordinate={startCoordinate}
        {maxSnapDistance}
        {snapToLayers}
        {snappedTo}
        {state}
        targetLayer={targetLayers}
        {value}
      />
    </div>
    <div class="absolute bottom-0">
      <OpenBackgroundSelectorButton {state} />
    </div>
  </div>
</ImportFlow>
