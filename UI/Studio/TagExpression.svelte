<script lang="ts">/**
 * Allows to create `and` and `or` expressions graphically
 */

import {UIEventSource} from "../../Logic/UIEventSource";
import type {TagConfigJson} from "../../Models/ThemeConfig/Json/TagConfigJson";
import BasicTagInput from "./TagInput/BasicTagInput.svelte";
import TagInput from "./TagInput/TagInput.svelte";
import {TrashIcon} from "@babeard/svelte-heroicons/mini";

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
    if (tags.length === 1) {
        tag.setData(tags[0])
    } else {
        config[mode] = tags
        tag.setData(config)
    }
}


function addBasicTag(value?: string) {
    const src = new UIEventSource(value)
    basicTags.data.push(src);
    basicTags.ping()
    src.addCallbackAndRunD(_ => update(_))
}

function removeTag(basicTag: UIEventSource<any>) {
    const index = basicTags.data.indexOf(basicTag)
    console.log("Removing", index, basicTag)
    if (index >= 0) {
        basicTag.setData(undefined)
        basicTags.data.splice(index, 1)
        basicTags.ping()
    }
}

function removeExpression(expr: UIEventSource<any>) {
    const index = expressions.data.indexOf(expr)
    if (index >= 0) {
        expr.setData(undefined)
        expressions.data.splice(index, 1)
        expressions.ping()
    }
}


function addExpression(expr?: TagConfigJson) {
    const src = new UIEventSource(expr)
    expressions.data.push(src);
    expressions.ping()
    src.addCallbackAndRunD(_ => update(_))
}


$: update(mode)
expressions.addCallback(_ => update(_))
basicTags.addCallback(_ => update(_))

let initialTag: TagConfigJson = tag.data

function initWith(initialTag: TagConfigJson) {
    if (typeof initialTag === "string") {
        addBasicTag(initialTag)
        return
    }
    mode = <"or" | "and">Object.keys(initialTag)[0]
    const subExprs = (<TagConfigJson[]>initialTag[mode])
    if (subExprs.length == 0) {
        return
    }
    if (subExprs.length == 1) {
        initWith(subExprs[0])
        return;
    }
    for (const subExpr of subExprs) {
        if (typeof subExpr === "string") {
            addBasicTag(subExpr)
        } else {
            addExpression(subExpr)
        }
    }
}

if (!initialTag) {
    addBasicTag()
} else {
    initWith(initialTag)
}


</script>


<div class="flex items-center">

    <select bind:value={mode}>
        <option value="and">and</option>
        {#if !uploadableOnly}
            <option value="or">or</option>
        {/if}
    </select>
    <div class="border-l-4 border-black flex flex-col ml-1 pl-1">
        {#each $basicTags as basicTag (basicTag)}
            <div class="flex">
                <BasicTagInput {overpassSupportNeeded} {uploadableOnly} tag={basicTag}/>
                <button class="border border-black rounded-full w-fit h-fit p-0" on:click={() => removeTag(basicTag)}>
                    <TrashIcon class="w-4 h-4 p-1"/>
                </button>
            </div>
        {/each}
        {#each $expressions as expression}
            <TagInput {overpassSupportNeeded} {uploadableOnly} tag={expression}>
                <button slot="delete" on:click={() => removeExpression(expression)}>
                    <TrashIcon class="w-4 h-4 p-1"/>
                    Delete subexpression
                </button>
            </TagInput>
        {/each}
        <div class="flex">
            <button class="w-fit" on:click={() => addBasicTag()}>
                Add a tag
            </button>
            <button class="w-fit" on:click={() => addExpression()}>
                Add an expression
            </button>
            <slot name="delete"/>
        </div>
    </div>

</div>
