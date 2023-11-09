<script lang="ts">
  import EditLayerState from "./EditLayerState"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
  import FullTagInput from "./TagInput/FullTagInput.svelte"
  import type { ConfigMeta } from "./configMeta"
  import { PencilAltIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { onDestroy } from "svelte"

  /**
   * Thin wrapper around 'TagInput' which registers the output with the state
   */
  export let path: (string | number)[]
  export let state: EditLayerState

  export let schema: ConfigMeta

  const initialValue = state.getCurrentValueFor(path)
  let tag: UIEventSource<TagConfigJson> = new UIEventSource<TagConfigJson>(initialValue)

  onDestroy(state.register(path, tag))

  let mode: "editing" | "set" = tag.data === undefined ? "editing" : "set"

  function simplify(tag: TagConfigJson): string {
    if (typeof tag === "string") {
      return tag
    }
    if (tag["and"]) {
      return "{ and: " + simplify(tag["and"].map(simplify).join(" ; ") + " }")
    }
    if (tag["or"]) {
      return "{ or: " + simplify(tag["or"].map(simplify).join(" ; ") + " }")
    }
  }
</script>

{#if mode === "editing"}
  <div class="interactive border-interactive">
    <h3>{schema.hints.question ?? "What tags should be applied?"}</h3>
    {schema.description}
    <FullTagInput {tag} />
    <div class="flex justify-end">
      <button
        class="primary w-fit"
        on:click={() => {
          mode = "set"
        }}
      >
        Save
      </button>
    </div>
    <div class="subtle">RegisteredTagInput based on schema: {JSON.stringify(schema)}</div>
  </div>
{:else}
  <div class="low-interaction flex justify-between">
    <div>
      {schema.path.at(-1)}
      {simplify($tag)}
    </div>
    <button
      on:click={() => {
        mode = "editing"
      }}
      class="secondary h-8 w-8 shrink-0 self-start rounded-full p-1"
    >
      <PencilAltIcon />
    </button>
  </div>
{/if}
