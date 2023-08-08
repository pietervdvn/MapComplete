<script lang="ts">/**
 * Little helper class to deal with choosing a builtin tagRendering or defining one yourself.
 * Breaks the ideology that everything should be schema based
 */
import EditLayerState from "./EditLayerState";
import type { ConfigMeta } from "./configMeta";
import type {
  MappingConfigJson,
  QuestionableTagRenderingConfigJson
} from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
import { UIEventSource } from "../../Logic/UIEventSource";
import * as questions from "../../assets/generated/layers/questions.json";

export let state: EditLayerState;
export let schema: ConfigMeta;
export let path: (string | number)[];

let value = state.getCurrentValueFor(path);

let mappings: MappingConfigJson[] = [];
for (const tr of questions.tagRenderings) {
  let description = tr["description"] ?? tr["question"] ?? "No description available";
  description = description["en"] ?? description;
  mappings.push({
    if: "value=" + tr["id"],
    then: {
      "en": "Builtin <b>" + tr["id"] + "</b> <div class='subtle'>" + description + "</div>"
    }
  });
}


const configBuiltin = new TagRenderingConfig(<QuestionableTagRenderingConfigJson>{
  question: "Which builtin element should be shown?",
  mappings
});


const configOverride = <QuestionableTagRenderingConfigJson>{
  render: "This is a builtin question which changes some properties. Editing those is not possible within MapComplete Studio"
};

const tags = new UIEventSource({ value });

tags.addCallbackAndRunD(tgs => {
  state.setValueAt(path, tgs["value"]);
});

</script>

{#if typeof value === "string"}
  <TagRenderingEditable config={configBuiltin} selectedElement={undefined} showQuestionIfUnknown={true} {state}
                        {tags} />

{:else}
  <div>
    TR{JSON.stringify(state.getCurrentValueFor(path))}
  </div>
{/if}
