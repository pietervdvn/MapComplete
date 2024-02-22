<script lang="ts">
  import EditLayerState from "./EditLayerState"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
  import { TagUtils } from "../../Logic/Tags/TagUtils"
  import FromHtml from "../Base/FromHtml.svelte"
  import { PencilIcon } from "@rgossiaux/svelte-heroicons/outline"
  import Region from "./Region.svelte"
  import type { ConfigMeta } from "./configMeta"
  import configs from "../../assets/schemas/questionabletagrenderingconfigmeta.json"
  import { Utils } from "../../Utils"
  import { ExclamationTriangle } from "@babeard/svelte-heroicons/solid/ExclamationTriangle"

  export let state: EditLayerState
  export let path: (string | number)[]
  let messages = state.messagesFor(path)
  let tag: UIEventSource<TagConfigJson> = state.getStoreFor([...path, "if"])
  let parsedTag = tag.map((t) => (t ? TagUtils.Tag(t) : undefined))
  let exampleTags = parsedTag.map((pt) => {
    if (!pt) {
      return {}
    }
    const keys = pt.usedKeys()
    const o = {}
    for (const key of keys) {
      o[key] = "value"
    }
    return o
  })

  let thenText: UIEventSource<Record<string, string>> = state.getStoreFor([...path, "then"])
  let thenTextEn = thenText.mapD((translation) =>
    typeof translation === "string" ? translation : translation["en"]
  )
  let editMode = Object.keys($thenText ?? {})?.length === 0

  let mappingConfigs: ConfigMeta[] = configs
    .filter((c) => c.path[0] === "mappings")
    .map((c) => <ConfigMeta>Utils.Clone(c))
    .map((c) => {
      c.path.splice(0, 1)
      return c
    })
    .filter((c) => c.path.length == 1 && c.hints.group !== "hidden")
</script>

<button
  on:click={() => {
    editMode = !editMode
  }}
>
  <PencilIcon class="h-6 w-6" />
</button>

{#if editMode}
  <div class="flex w-full items-start justify-between">
    <div class="flex w-full flex-col">
      <Region {state} configs={mappingConfigs} {path} />
    </div>

    <slot name="delete" />
  </div>
{:else}
  <div>
    {#if Object.keys($thenText).length > 0}
      <b>
        {$thenTextEn}
      </b>
    {:else}
      <i>No then is set</i>
    {/if}
    <FromHtml src={$parsedTag?.asHumanString(false, false, $exampleTags)} />
    {#if $messages.length > 0}
      <div class="alert m-2 flex">
        <ExclamationTriangle class="h-6 w-6" />
        {$messages.length} errors
      </div>
    {/if}
  </div>
{/if}
