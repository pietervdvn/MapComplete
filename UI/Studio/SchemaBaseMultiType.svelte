<script lang="ts">

    import EditLayerState from "./EditLayerState";
    import type {ConfigMeta} from "./configMeta";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import type {
        QuestionableTagRenderingConfigJson
    } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
    import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
    import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
    import {onDestroy} from "svelte";
    import SchemaBasedInput from "./SchemaBasedInput.svelte";

    /**
     * If 'types' is defined: allow the user to pick one of the types to input.
     */

    export let state: EditLayerState
    export let path: (string | number)[] = []
    export let schema: ConfigMeta
    let value = new UIEventSource<string>(undefined)


    const configJson: QuestionableTagRenderingConfigJson = {
        id: "TYPE_OF:" + path.join("_"),
        question: "Which subcategory is needed?",
        questionHint: schema.description,
        mappings: schema.hints.types.split(";").map(opt => opt.trim()).filter(opt => opt.length > 0).map((opt, i) => ({
            if: "value=" + i,
            then: opt
        }))
    }
    const config = new TagRenderingConfig(configJson, "config based on " + schema.path.join("."))
    let tags = new UIEventSource<Record<string, string>>({})

    let chosenOption: number = undefined
    let subSchemas: ConfigMeta[] = []
    onDestroy(tags.addCallback(tags => {
        chosenOption = Number(tags["value"])
        const type = schema.type[chosenOption]
        const cleanPath =  <string[]> path.filter(p => typeof p === "string")
        for (const crumble of Object.keys(type.properties)) {
            console.log("Searching entries for", [...cleanPath, crumble])
            subSchemas.push(...(state.getSchema([...cleanPath, crumble])))
        }
    }))


</script>

<div>
    <TagRenderingEditable {config} showQuestionIfUnknown={true} {state} {tags}/>
</div>

{#if chosenOption !== undefined}
    <div class="pl-2 border-2 border-dashed border-gray-300 flex flex-col gap-y-2">
        {#each subSchemas as subschema}
        {JSON.stringify(subschema)}
            <SchemaBasedInput {state} schema={subschema} path={[...path]}></SchemaBasedInput>
        {/each}
    </div>
{/if}
