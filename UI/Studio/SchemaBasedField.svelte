<script lang="ts">

    import {UIEventSource} from "../../Logic/UIEventSource";
    import type {ConfigMeta} from "./configMeta";
    import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
    import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
    import nmd from "nano-markdown"
    import type {
        QuestionableTagRenderingConfigJson
    } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
    import EditLayerState from "./EditLayerState";
    import { onDestroy } from "svelte";


    export let state: EditLayerState
    export let path: (string | number)[] = []
    export let schema: ConfigMeta
    let value = new UIEventSource<string>(undefined)

    const configJson: QuestionableTagRenderingConfigJson = {
        id: path.join("_"),
        render: schema.type === "boolean" ? undefined : schema.hints.inline ?? schema.path.at(-1) + ": <b>{value}</b>",
        question: schema.hints.question,
        questionHint: nmd(schema.description),
        freeform: schema.type === "boolean" ? undefined : {
            key: "value",
            type: schema.hints.typehint ?? "string",
            inline: schema.hints.inline !== undefined
        },
    }

    if (schema.hints.default) {
        configJson.mappings = [{
            if: "value=", // We leave this blank
            then: schema.path.at(-1) + " is not set. The default value <b>" + schema.hints.default + "</b> will be used. " + (schema.hints.ifunset ?? ""),
        }]
    } else if (!schema.required) {
        configJson.mappings = [{
            if: "value=",
            then: schema.path.at(-1) + " is not set. " + (schema.hints.ifunset ?? ""),
        }]
    }

    if (schema.type === "boolean" || (Array.isArray(schema.type) && schema.type.some(t => t["type"] === "boolean"))) {
        configJson.mappings = configJson.mappings ?? []
        configJson.mappings.push(
            {
                if: "value=true",
                then: "Yes "+(schema.hints?.iftrue??"")
            },
            {
                if: "value=false",
                then: "No "+(schema.hints?.iffalse??"")
            }
        )
    }

    if (schema.hints.suggestions) {
        if (!configJson.mappings) {
            configJson.mappings = []
        }
        configJson.mappings.push(...schema.hints.suggestions)
    }
    let config: TagRenderingConfig
    let err: string = undefined
    try {
        config = new TagRenderingConfig(configJson, "config based on " + schema.path.join("."))
    } catch (e) {
        console.error(e, config)
        err = path.join(".") + " " + e
    }
    let startValue = state.getCurrentValueFor(path)
    if (startValue?.["en"]) {
        startValue = startValue["en"]
    }
    console.log("Startvalue for", path.join("."), "is", startValue)
    let tags = new UIEventSource<Record<string, string>>({value: startValue ?? ""})
    onDestroy(state.register(path, tags.map(tgs => {
        const v = tgs["value"];
        if (schema.type === "boolan") {
            return v === "true" || v === "yes" || v === "1"
        }
        if (schema.type === "number") {
            return Number(v)
        }
        return v
    })))
</script>

{#if err !== undefined}
    <span class="alert">{err}</span>
    {JSON.stringify(schema)}
{:else}
    <div>
        <TagRenderingEditable {config} selectedElement={undefined} showQuestionIfUnknown={true} {state} {tags}/>
    </div>
{/if}
