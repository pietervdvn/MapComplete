<script lang="ts">

    import {UIEventSource} from "../../Logic/UIEventSource";
    import {Translation} from "../i18n/Translation";
    import type {ConfigMeta} from "./configMeta";
    import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
    import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
    import type {
        QuestionableTagRenderingConfigJson
    } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
    import EditLayerState from "./EditLayerState";


    export let state: EditLayerState
    export let schema: ConfigMeta
    export let title: string | undefined

    let value = new UIEventSource<string>(undefined)
    let feedback = new UIEventSource<Translation>(undefined)

    const configJson: QuestionableTagRenderingConfigJson = {
        id: schema.path.join("."),
        render: schema.path.at(-1) + ": <b>{value}</b>",
        question: schema.hints.question,
        questionHint: schema.description,
        freeform: {
            key: "value",
            type: schema.hints.typehint ?? "string"
        }
    }

    if (!schema.required) {
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
</script>

{#if err !== undefined}
    <span class="alert">{err}</span>
{:else}
    <div>
        <TagRenderingEditable {config} showQuestionIfUnknown={true} {state} {tags}/>
    </div>
{/if}
