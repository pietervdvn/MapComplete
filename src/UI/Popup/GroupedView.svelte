<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import SelectedElementView from "../BigComponents/SelectedElementView.svelte"
  import TagRenderingAnswer from "./TagRendering/TagRenderingAnswer.svelte"

  export let state: SpecialVisualizationState
  export let selectedElement: Feature
  export let tags: UIEventSource<OsmTags>
  export let labels: string[]
  export let header: string
  export let layer: LayerConfig

  let headerTr = layer.tagRenderings.find(tr => tr.id === header)

</script>

<AccordionSingle>
  <div slot="header">
    <TagRenderingAnswer {tags} {layer} config={headerTr} {state} {selectedElement} />
  </div>
  <SelectedElementView mustMatchLabels={new Set(labels)} {state} {layer} {tags} {selectedElement}/>
</AccordionSingle>
