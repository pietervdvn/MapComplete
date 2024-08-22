<script lang="ts">
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig"
  import { Utils } from "../../../Utils"
  import { Translation } from "../../i18n/Translation"
  import TagRenderingMapping from "./TagRenderingMapping.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { twMerge } from "tailwind-merge"

  export let tags: UIEventSource<Record<string, string> | undefined>

  export let state: SpecialVisualizationState
  export let selectedElement: Feature
  export let layer: LayerConfig
  export let config: TagRenderingConfig
  export let extraClasses: string | undefined = undefined
  export let defaultSize = "w-full"
  export let noIcons = false

  export let id: string = undefined

  if (config === undefined) {
    throw "Config is undefined in tagRenderingAnswer"
  }
  let trs: Store<{ then: Translation; icon?: string; iconClass?: string }[]> = tags.mapD((tags) =>
    Utils.NoNull(config?.GetRenderValues(tags))
  )
</script>

{#if config !== undefined && (config?.condition === undefined || config.condition.matchesProperties($tags))}
  <div {id} class={twMerge("link-underline flex h-full  flex-col", defaultSize, extraClasses)}>
    {#if $trs.length === 1}
      <TagRenderingMapping
        mapping={$trs[0]}
        {tags}
        {state}
        {selectedElement}
        {layer}
        clss={config?.classes?.join(" ") ?? ""}
        {noIcons}
      />
    {/if}
    {#if $trs.length > 1}
      <ul>
        {#each $trs as mapping}
          <li>
            <TagRenderingMapping {mapping} {tags} {state} {selectedElement} {layer} {noIcons}/>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
