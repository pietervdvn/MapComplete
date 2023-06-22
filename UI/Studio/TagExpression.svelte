<script lang="ts">/**
 * Allows to create `and` and `or` expressions graphically
 */

import {UIEventSource} from "../../Logic/UIEventSource";
import type {TagConfigJson} from "../../Models/ThemeConfig/Json/TagConfigJson";
import BasicTagInput from "./TagInput/BasicTagInput.svelte";
import {onDestroy} from "svelte";
import TagInfoStats from "./TagInfoStats.svelte";
import TagInput from "./TagInput/TagInput.svelte";
import exp from "constants";

export let tag: UIEventSource<TagConfigJson>
let mode: "and" | "or" = "and"

let basicTags: UIEventSource<UIEventSource<string>[]> = new UIEventSource([])

/**
 * Sub-expressions
 */
let expressions: UIEventSource<UIEventSource<TagConfigJson>[]> = new UIEventSource([])
export let uploadableOnly: boolean
export let overpassSupportNeeded: boolean

function update(_) {
    let config: TagConfigJson = <any>{}
    if (!mode) {
        return
    }
    const tags = []

    const subpartSources = (<UIEventSource<string | TagConfigJson>[]>basicTags.data).concat(expressions.data)
    for (const src of subpartSources) {
        const t = src.data
        if (!t) {
            // We indicate upstream that this value is invalid
            tag.setData(undefined)
            return
        }
        tags.push(t)
    }
    config[mode] = tags
    tag.setData(config)
}


function addBasicTag() {
    const src = new UIEventSource(undefined)
    basicTags.data.push(src);
    basicTags.ping()
    src.addCallbackAndRunD(_ => update(_))
}

function addExpression() {
    const src = new UIEventSource(undefined)
    expressions.data.push(src);
    expressions.ping()
    src.addCallbackAndRunD(_ => update(_))
}


$: update(mode)


addBasicTag()

</script>


<div class="flex items-center">

    <select bind:value={mode}>
        <option value="and">and</option>
        {#if !uploadableOnly}
            <option value="or">or</option>
        {/if}
    </select>
    <div class="border-l-4 border-black flex flex-col ml-1 pl-1">
        {#each $basicTags as basicTag}
            <BasicTagInput {overpassSupportNeeded} {uploadableOnly} tag={basicTag}/>
        {/each}
        {#each $expressions as expression}
            <TagInput {overpassSupportNeeded} {uploadableOnly} tag={expression}/>
        {/each}
        <div class="flex">
            <button class="primary w-fit" on:click={addBasicTag}>
                Add a tag
            </button>
            <button class="w-fit" on:click={addExpression}>
                Add an expression
            </button>
        </div>
    </div>

</div>
