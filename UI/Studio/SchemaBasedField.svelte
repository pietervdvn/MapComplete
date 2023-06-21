<script lang="ts">

    import {UIEventSource} from "../../Logic/UIEventSource";
    import type {ConfigMeta} from "./configMeta";
    import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
    import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
    import type {
        QuestionableTagRenderingConfigJson
    } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
    import EditLayerState from "./EditLayerState";


    export let state: EditLayerState
    export let path: (string | number)[] = []
    export let schema: ConfigMeta
    let value = new UIEventSource<string>(undefined)


    const configJson: QuestionableTagRenderingConfigJson = {
        id: path.join("_"),
        render: schema.hints.inline ?? schema.path.at(-1) + ": <b>{value}</b>",
        question: schema.hints.question,
        questionHint: schema.description,
        freeform: {
            key: "value",
            type: schema.hints.typehint ?? "string",
            inline: schema.hints.inline !== undefined
        }
    }

    if (schema.hints.default) {
        configJson.mappings = [{
            if: "value=", // +schema.hints.default,
            then: schema.path.at(-1) + " is not set. The default value <b>" + schema.hints.default + "</b> will be used. " + (schema.hints.ifunset ?? ""),
        }]
    } else if (!schema.required) {
        configJson.mappings = [{
            if: "value=",
            then: schema.path.at(-1) + " is not set. " + (schema.hints.ifunset ?? ""),
        }]
    }
    let config: TagRenderingConfig
    let err: string = undefined
    try {
        config = new TagRenderingConfig(configJson, "config based on " + schema.path.join("."))
    } catch (e) {
        console.error(e, config)
        err = e
    }
    let tags = new UIEventSource<Record<string, string>>({})
    state.register(path, tags.map(tgs => tgs["value"]))
</script>

{#if err !== undefined}
    <span class="alert">{err}</span>
{:else}
    <div>
        <TagRenderingEditable {config} showQuestionIfUnknown={true} {state} {tags}/>
    </div>
{/if}
