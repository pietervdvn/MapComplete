<script lang="ts">

    import EditLayerState from "./EditLayerState";
    import type { ConfigMeta } from "./configMeta";
    import { UIEventSource } from "../../Logic/UIEventSource";
    import type {
        QuestionableTagRenderingConfigJson
    } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
    import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
    import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
    import { onDestroy } from "svelte";
    import SchemaBasedInput from "./SchemaBasedInput.svelte";
    import type { JsonSchemaType } from "./jsonSchema";
    // @ts-ignore
    import nmd from "nano-markdown";

    /**
     * If 'types' is defined: allow the user to pick one of the types to input.
     */

    export let state: EditLayerState
    export let path: (string | number)[] = []
    export let schema: ConfigMeta
    const defaultOption = schema.hints.typesdefault ? Number(schema.hints.typesdefault) : undefined

    const hasBooleanOption = (<JsonSchemaType[]>schema.type)?.findIndex(t => t["type"] === "boolean")
    const types = schema.hints.types.split(";")
    if (hasBooleanOption >= 0) {
        console.log(path.join("."), ": types are", types, ", boolean index is", hasBooleanOption)
        types.splice(hasBooleanOption)
    }

    const configJson: QuestionableTagRenderingConfigJson = {
        id: "TYPE_OF:" + path.join("_"),
        question: "Which subcategory is needed?",
        questionHint: nmd(schema.description),
        mappings: types.map(opt => opt.trim()).filter(opt => opt.length > 0).map((opt, i) => ({
            if: "value=" + i,
            addExtraTags: ["direct="],
            then: opt + (i === defaultOption ? " (Default)" : "")
        }))
    }
    let tags = new UIEventSource<Record<string, string>>({})

    if (hasBooleanOption >= 0) {
        configJson.mappings.unshift(
          {
              if: "direct=true",
              then: "Yes " + (schema.hints.iftrue ?? ""),
              addExtraTags: ["value="]
          },
          {
              if: "direct=false",
              then: "No " + (schema.hints.iffalse ?? ""),
              addExtraTags: ["value="]
          }
        )
    }
    const config = new TagRenderingConfig(configJson, "config based on " + schema.path.join("."))


    const existingValue = state.getCurrentValueFor(path)
    console.log("Setting direct: ", hasBooleanOption, path.join("."), existingValue)
    if (hasBooleanOption >= 0 && (existingValue === true || existingValue === false)) {
        tags.setData({direct: "" + existingValue})
    } else if (existingValue) {
        // We found an existing value. Let's figure out what type it matches and select that one
        // We run over all possibilities and check what is required
        const possibleTypes = []
        outer: for (let i = 0; i < (<[]>schema.type).length; i++) {
            const type = schema.type[i];
            if (type.required) {
                for (const requiredAttribute of type.required) {
                    if (existingValue[requiredAttribute] === undefined) {
                        console.log(path.join("."), " does not have required field", requiredAttribute, " so it cannot be type ", type)
                        // The 'existingValue' does _not_ have this required attribute, so it cannot be of this type
                        continue outer
                    }
                }
                possibleTypes.push(i)
            } else {
                possibleTypes.push(i)
            }
        }

        if (possibleTypes.length > 0) {
            tags.setData({value: "" + possibleTypes[0]})
        }
    } else if (defaultOption !== undefined) {
        tags.setData({value: "" + defaultOption})
    }

    if (hasBooleanOption >= 0) {

        const directValue = tags.mapD(tags => {
            if(tags["value"]){
                return undefined
            }
            return tags["direct"] === "true";
        })
        onDestroy(state.register(path, directValue, true))
    }
    
    let chosenOption: number = defaultOption
    let subSchemas: ConfigMeta[] = []
    onDestroy(tags.addCallbackAndRun(tags => {
        const oldOption = chosenOption
        chosenOption = tags["value"] ? Number(tags["value"]) : defaultOption
        if(chosenOption !== oldOption){
            // Reset the values beneath
            subSchemas = []
            state.setValueAt(path, undefined)
        }
        const type = schema.type[chosenOption]
        if (!type) {
            return
        }
        if (!type.properties) {
            return
        }
        const cleanPath = <string[]>path.filter(p => typeof p === "string")
        for (const crumble of Object.keys(type.properties)) {
            subSchemas.push(...(state.getSchema([...cleanPath, crumble])))
        }
    }))

    

</script>

<div class="p-2 border-2 border-dashed border-gray-300 flex flex-col gap-y-2">
    <div>
        <TagRenderingEditable selectedElement={undefined} {config} showQuestionIfUnknown={true} {state} {tags}/>
    </div>

    {#if chosenOption !== undefined}
        {#each subSchemas as subschema}
            <SchemaBasedInput {state} schema={subschema}
                              path={[...path, (subschema?.path?.at(-1) ?? "???")]}></SchemaBasedInput>
        {/each}
    {/if}
</div>
