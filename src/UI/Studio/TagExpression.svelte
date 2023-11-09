<script lang="ts">
  /**
   * Allows to create `and` and `or` expressions graphically
   */

  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
  import BasicTagInput from "./TagInput/BasicTagInput.svelte"
  import FullTagInput from "./TagInput/FullTagInput.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"

  export let tag: UIEventSource<TagConfigJson>
  let mode: "and" | "or" = "and"

  let basicTags: UIEventSource<UIEventSource<string>[]> = new UIEventSource([])

  /**
   * Sub-expressions
   */
  let expressions: UIEventSource<UIEventSource<TagConfigJson>[]> = new UIEventSource([])

  export let uploadableOnly: boolean
  export let overpassSupportNeeded: boolean

  export let silent: boolean

  function update(_) {
    let config: TagConfigJson = <any>{}
    if (!mode) {
      return
    }
    const tags = []

    const subpartSources = (<UIEventSource<string | TagConfigJson>[]>basicTags.data).concat(
      expressions.data
    )
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
    basicTags.data.push(src)
    basicTags.ping()
    src.addCallbackAndRunD((_) => update(_))
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
    expressions.data.push(src)
    expressions.ping()
    src.addCallbackAndRunD((_) => update(_))
  }

  $: update(mode)
  expressions.addCallback((_) => update(_))
  basicTags.addCallback((_) => update(_))

  let initialTag: TagConfigJson = tag.data

  function initWith(initialTag: TagConfigJson) {
    if (typeof initialTag === "string") {
      if (initialTag.startsWith("{")) {
        initialTag = JSON.parse(initialTag)
      } else {
        addBasicTag(initialTag)
        return
      }
    }
    mode = <"or" | "and">Object.keys(initialTag)[0]
    const subExprs = <TagConfigJson[]>initialTag[mode]
    if (!subExprs || subExprs.length == 0) {
      return
    }
    if (subExprs.length == 1) {
      initWith(subExprs[0])
      return
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
  {#if !uploadableOnly}
    <select bind:value={mode}>
      <option value="and">and</option>
      <option value="or">or</option>
    </select>
  {/if}

  <div class="ml-1 flex flex-col border-l-4 border-black pl-1">
    {#each $basicTags as basicTag (basicTag)}
      <div class="flex">
        <BasicTagInput {silent} {overpassSupportNeeded} {uploadableOnly} tag={basicTag} on:submit />
        {#if $basicTags.length + $expressions.length > 1}
          <button
            class="h-fit w-fit rounded-full border border-black p-0"
            on:click={() => removeTag(basicTag)}
          >
            <TrashIcon class="h-4 w-4 p-1" />
          </button>
        {/if}
      </div>
    {/each}
    {#each $expressions as expression}
      <FullTagInput {silent} {overpassSupportNeeded} {uploadableOnly} tag={expression}>
        <button class="small" slot="delete" on:click={() => removeExpression(expression)}>
          <TrashIcon class="h-3 w-3 p-0" />
          Delete subexpression
        </button>
      </FullTagInput>
    {/each}
    <div class="flex">
      <button class="small w-fit" on:click={() => addBasicTag()}>Add a tag</button>
      {#if !uploadableOnly}
        <!-- Do not allow to add an expression, as everything is 'and' anyway -->
        <button class="small w-fit" on:click={() => addExpression()}>Add an expression</button>
      {/if}
      <slot name="delete" />
    </div>
  </div>
</div>
