<script lang="ts">
  import type { ConfigMeta } from "./configMeta"
  import EditLayerState from "./EditLayerState"
  import type { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"

  export let schema: ConfigMeta
  export let state: EditLayerState
  export let path: (string | number)[] = []

  const configJson: QuestionableTagRenderingConfigJson = {
    mappings: schema.hints.suggestions,
    multiAnswer: true,
    id: "multi_anwser_" + path.join("_"),
    question: schema.hints.question,
  }
  const tags = new UIEventSource({})

  {
    // Setting the initial value
    const v = <string[]>state.getCurrentValueFor(path)
    if (v && v.length > 0) {
      tags.setData({ value: v.join(";") })
    }
  }

  tags.addCallbackD((tags) => {
    const values = tags["value"]?.split(";")
    if (!values) {
      return
    }
    state.setValueAt(path, values)
  })
  const config = new TagRenderingConfig(configJson)
</script>

<div>
  <TagRenderingEditable {config} selectedElement={undefined} {state} {tags} />
</div>
