<script lang="ts">
    /**
     * The comparison tool loads json-data from a speficied URL, eventually post-processes it
     * and compares it with the current object
     */
    import Loading from "../Base/Loading.svelte"
    import type { SpecialVisualizationState } from "../SpecialVisualization"
    import { Store, UIEventSource } from "../../Logic/UIEventSource"
    import ComparisonTable from "./ComparisonTable.svelte"
    import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
    import type { Feature } from "geojson"
    import type { OsmTags } from "../../Models/OsmFeature"

    export let externalData: Store<{ success: {content: Record<string, string> } } | { error: string } | undefined | null /* null if no URL is found, undefined if loading*/>
    export let state: SpecialVisualizationState
    export let tags: UIEventSource<OsmTags>
    export let layer: LayerConfig
    export let feature: Feature
    export let readonly = false
</script>
{#if $externalData === null}
  <!-- empty block -->
{:else if $externalData === undefined}
  <Loading>{$externalData}</Loading>
{:else if $externalData["error"] !== undefined}
  <div class="alert">
    Something went wrong: {$externalData["error"]}
  </div>
{:else if $externalData["success"] !== undefined}
  <ComparisonTable
    externalProperties={$externalData["success"]}
    osmProperties={$tags}
    {state}
    {feature}
    {layer}
    {tags}
    {readonly}
  />
{/if}
