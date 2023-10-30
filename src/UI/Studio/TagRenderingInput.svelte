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
import { Store, UIEventSource } from "../../Logic/UIEventSource";
import * as questions from "../../assets/generated/layers/questions.json";
import MappingInput from "./MappingInput.svelte";
import { TrashIcon } from "@rgossiaux/svelte-heroicons/outline";
import questionableTagRenderingSchemaRaw from "../../assets/schemas/questionabletagrenderingconfigmeta.json";
import SchemaBasedField from "./SchemaBasedField.svelte";
import Region from "./Region.svelte";

export let state: EditLayerState;
export let schema: ConfigMeta;
export let path: (string | number)[];

let value = state.getCurrentValueFor(path);

/**
 * Allows the theme builder to create 'writable' themes.
 * Should only be enabled for 'tagrenderings' in the theme, if the source is OSM
 */
let allowQuestions: Store<boolean> = (state.configuration.mapD(config => config.source?.geoJson === undefined))


let mappingsBuiltin: MappingConfigJson[] = [];
let perLabel: Record<string, MappingConfigJson> = {}
for (const tr of questions.tagRenderings) {
  let description = tr["description"] ?? tr["question"] ?? "No description available";
  description = description["en"] ?? description;
  if(tr["labels"]){
    const labels: string[] = tr["labels"]
    for (const label of labels) {
      let labelMapping: MappingConfigJson = perLabel[label] 
      
      if(!labelMapping){
        labelMapping = {
          if: "value="+label,
          then: {
            en: "Builtin collection <b>"+label+"</b>:"
          }
        }
        perLabel[label] = labelMapping
        mappingsBuiltin.push(labelMapping)
      }
      labelMapping.then.en = labelMapping.then.en + "<div>"+description+"</div>"
    }
  }
  
  
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
const store = state.getStoreFor(path);
tags.addCallbackAndRunD(tgs => {
  store.setData(tgs["value"]);
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

const items = new Set(["question", "questionHint", "multiAnswer", "freeform", "render", "condition", "metacondition", "mappings", "icon"]);
const ignored = new Set(["labels", "description", "classes"]);

const freeformSchema = <ConfigMeta[]>questionableTagRenderingSchemaRaw
  .filter(schema => schema.path.length == 2 && schema.path[0] === "freeform" && ($allowQuestions || schema.path[1] === "key"));
const missing: string[] = questionableTagRenderingSchemaRaw.filter(schema => schema.path.length >= 1 && !items.has(schema.path[0]) && !ignored.has(schema.path[0])).map(schema => schema.path.join("."));
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
    {#if $allowQuestions}
      <SchemaBasedField {state} path={[...path,"question"]} schema={topLevelItems["question"]} />
      <SchemaBasedField {state} path={[...path,"questionHint"]} schema={topLevelItems["questionHint"]} />
    {/if}
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

    <button class="primary"
            on:click={() =>{ initMappings(); mappings.data.push({if: undefined, then: {}}); mappings.ping()} }>
      Add a mapping
    </button>

    <SchemaBasedField {state} path={[...path,"multiAnswer"]} schema={topLevelItems["multiAnswer"]} />

    <h3>Text field and input element configuration</h3>
    <div class="border-l pl-2 border-gray-800 border-dashed">
      <SchemaBasedField {state} path={[...path,"render"]} schema={topLevelItems["render"]} />
      <Region {state} {path} configs={freeformSchema} />
      <SchemaBasedField {state} path={[...path,"icon"]} schema={topLevelItems["icon"]} />

    </div>

    <SchemaBasedField {state} path={[...path,"condition"]} schema={topLevelItems["condition"]} />
    <SchemaBasedField {state} path={[...path,"metacondition"]} schema={topLevelItems["metacondition"]} />

    {#each missing as field}
      <SchemaBasedField {state} path={[...path,field]} schema={topLevelItems[field]} />
    {/each}
  </div>
{/if}
