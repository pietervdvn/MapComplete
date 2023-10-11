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
    import type { JsonSchemaType } from "./jsonSchema";
    import { ConfigMetaUtils } from "./configMeta.ts"

    export let state: EditLayerState
    export let path: (string | number)[] = []
    export let schema: ConfigMeta
    let value = new UIEventSource<string>(undefined)
    
    const isTranslation = schema.hints.typehint === "translation" || schema.hints.typehint === "rendered" || ConfigMetaUtils.isTranslation(schema)
    let type = schema.hints.typehint ?? "string"
    if(isTranslation){
        type = "translation"
    }
    if(type.endsWith("[]")){
        type = type.substring(0, type.length - 2) 
    }

    const configJson: QuestionableTagRenderingConfigJson = {
        id: path.join("_"),
        render: schema.type === "boolean" ? undefined : ((schema.hints.inline ?? schema.path.at(-1) )+ ": <b>{translated(value)}</b>"),
        question: schema.hints.question,
        questionHint: nmd(schema.description),
        freeform: schema.type === "boolean" ? undefined : {
            key: "value",
            type,
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

    function mightBeBoolean(type: undefined | JsonSchemaType): boolean {
        if(type === undefined){
            return false
        }
        if(type["type"]){
            type = type["type"]
        }
        if(type === "boolean"){
            return true
        }
        if(!Array.isArray(type)){
            return false
        }
        
        return type.some(t => mightBeBoolean(t) )
    }
    if (mightBeBoolean(schema.type)) {
        configJson.mappings = configJson.mappings ?? []
        configJson.mappings.push(
            {
                if: "value=true",
                then: "Yes: "+(schema.hints?.iftrue??"")
            },
            {
                if: "value=false",
                then: "No: "+(schema.hints?.iffalse??"")
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
    const tags = new UIEventSource<Record<string, string>>({value: startValue ?? ""})
    try {
        onDestroy(state.register(path, tags.map(tgs => {
            const v = tgs["value"];
            if(typeof v !== "string"){
                return v
            }
            if (schema.type === "boolan") {
                return v === "true" || v === "yes" || v === "1"
            }
            if(mightBeBoolean(schema.type)){
              if(v === "true" || v === "yes" || v === "1"){
                return true
              }
              if(v === "false" || v === "no" || v === "0"){
                console.log("Setting false...")
                return false
              }
            }
            if (schema.type === "number") {
                return Number(v)
            }
            if (isTranslation) {
                if (v === "") {
                    return {}
                }
                return JSON.parse(v)
            }
            return v
        }), isTranslation))
    }catch (e) {
        console.error("Could not register", path,"due to",e)
    }
</script>

{#if err !== undefined}
    <span class="alert">{err}</span>
{:else}
    <div class="w-full flex flex-col">
        <TagRenderingEditable {config} selectedElement={undefined} showQuestionIfUnknown={true} {state} {tags}/>
    </div>
{/if}
