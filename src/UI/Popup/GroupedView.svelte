<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import SelectedElementView from "../BigComponents/SelectedElementView.svelte"
  import TagRenderingAnswer from "./TagRendering/TagRenderingAnswer.svelte"
  import TagRenderingEditableDynamic from "./TagRendering/TagRenderingEditableDynamic.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"

  export let state: SpecialVisualizationState
  export let selectedElement: Feature
  export let tags: UIEventSource<OsmTags>
  export let labels: string[]
  export let header: string
  export let layer: LayerConfig

  let headerTr = layer.tagRenderings.find((tr) => tr.id === header)
  let trgs: TagRenderingConfig[] = []
  let seenIds = new Set<string>()
  for (const label of labels) {
    for (const tr of layer.tagRenderings) {
      if (seenIds.has(tr.id)) {
        continue
      }
      if (label === tr.id || tr.labels.some((l) => l === label)) {
        trgs.push(tr)
        seenIds.add(tr.id)
      }
    }
  }
</script>

<AccordionSingle>
  <div slot="header">
    <TagRenderingAnswer {tags} {layer} config={headerTr} {state} {selectedElement} />
  </div>
  {#each trgs as config (config.id)}
    <TagRenderingEditableDynamic {tags} {config} {state} {selectedElement} {layer} />
  {/each}
</AccordionSingle>
