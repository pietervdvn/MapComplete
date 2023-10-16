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
import MappingInput from "./MappingInput.svelte";
import { TrashIcon } from "@rgossiaux/svelte-heroicons/outline";
import questionableTagRenderingSchemaRaw from "../../assets/schemas/questionabletagrenderingconfigmeta.json";
import SchemaBasedField from "./SchemaBasedField.svelte";
import Region from "./Region.svelte";

export let state: EditLayerState;
export let schema: ConfigMeta;
export let path: (string | number)[];

let value = state.getCurrentValueFor(path) ;

let mappingsBuiltin: MappingConfigJson[] = [];
for (const tr of questions.tagRenderings) {
  let description = tr["description"] ?? tr["question"] ?? "No description available";
  description = description["en"] ?? description;
  mappingsBuiltin.push({
    if: "value=" + tr["id"],
    then: {
      "en": "Builtin <b>" + tr["id"] + "</b> <div class='subtle'>" + description + "</div>"
    }
  });
}


const configBuiltin = new TagRenderingConfig(<QuestionableTagRenderingConfigJson>{
  question: "Which builtin element should be shown?",
  mappings: mappingsBuiltin
});


const tags = new UIEventSource({ value });
const store = state.getStoreFor(path)
tags.addCallbackAndRunD(tgs => {
  store.setData(tgs["value"])
});

let mappings: UIEventSource<MappingConfigJson[]> = state.getStoreFor([...path, "mappings"]);

const topLevelItems: Record<string, ConfigMeta> = {};
for (const item of questionableTagRenderingSchemaRaw) {
  if (item.path.length === 1) {
    topLevelItems[item.path[0]] = <ConfigMeta>item;
  }
}

function initMappings() {
  if (mappings.data === undefined) {
    mappings.setData([]);
  }
}

const freeformSchema = <ConfigMeta[]>  questionableTagRenderingSchemaRaw.filter(schema => schema.path.length >= 1 && schema.path[0] === "freeform");
</script>

{#if typeof value === "string"}

  <div class="flex low-interaction">
    <TagRenderingEditable config={configBuiltin} selectedElement={undefined} showQuestionIfUnknown={true} {state}
                          {tags} />
    <slot name="upper-right" />
  </div>
{:else}
  <div class="flex flex-col w-full p-1 gap-y-1">
    <div class="flex justify-end">
      <slot name="upper-right" />
    </div>

    <SchemaBasedField {state} path={[...path,"question"]} schema={topLevelItems["question"]}></SchemaBasedField>
    <SchemaBasedField {state} path={[...path,"questionHint"]} schema={topLevelItems["questionHint"]}></SchemaBasedField>
    <SchemaBasedField {state} path={[...path,"render"]} schema={topLevelItems["render"]}></SchemaBasedField>

    {#each ($mappings ?? []) as mapping, i (mapping)}
      <div class="flex interactive w-full">
        <MappingInput {mapping} {state} path={path.concat(["mappings", i])}>
          <button slot="delete" class="rounded-full no-image-background" on:click={() => { 
            initMappings();
                      mappings.data.splice(i, 1)
                      mappings.ping()
                   }}>
            <TrashIcon class="w-4 h-4" />
          </button>
        </MappingInput>
      </div>
    {/each}

    <button class="small primary"
            on:click={() =>{ initMappings(); mappings.data.push({if: undefined, then: {}}); mappings.ping()} }>
      Add a mapping
    </button>

    <SchemaBasedField {state} path={[...path,"multiAnswer"]} schema={topLevelItems["multiAnswer"]}></SchemaBasedField>
    
    <div class="border border-gray-200 border-dashed">
      <h3>Text field and input element configuration</h3>
    <Region {state} {path} configs={freeformSchema}/>
    </div>

  </div>
{/if}
