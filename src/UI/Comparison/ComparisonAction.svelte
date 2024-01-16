<script lang="ts">
    import { UIEventSource } from "../../Logic/UIEventSource"
    import type { OsmTags } from "../../Models/OsmFeature"
    import type { SpecialVisualizationState } from "../SpecialVisualization"
    import type { Feature } from "geojson"
    import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
    import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
    import { Tag } from "../../Logic/Tags/Tag"
    import Loading from "../Base/Loading.svelte"

    export let key: string
    export let externalProperties: Record<string, string>

    export let tags: UIEventSource<OsmTags>
    export let state: SpecialVisualizationState
    export let feature: Feature
    export let layer: LayerConfig

    export let readonly = false

    let currentStep: "init" | "applying" | "done" = "init"

    /**
     * Copy the given key into OSM
     * @param key
     */
    async function apply(key: string) {
        currentStep = "applying"
        const change = new ChangeTagAction(
            tags.data.id,
            new Tag(key, externalProperties[key]),
            tags.data,
            {
                theme: state.layout.id,
                changeType: "import",
            })
        await state.changes.applyChanges(await change.CreateChangeDescriptions())
        currentStep = "done"
    }
</script>

<tr>
  <td><b>{key}</b></td>

  <td>
    {#if externalProperties[key].startsWith("http")}
      <a href={externalProperties[key]} target="_blank">
        {externalProperties[key]}
      </a>
    {:else}
      {externalProperties[key]}
    {/if}
  </td>
  {#if !readonly}
    <td>
      {#if currentStep === "init"}
        <button class="small" on:click={() => apply(key)}>
          Apply
        </button>
      {:else if currentStep === "applying"}
        <Loading />
      {:else if currentStep === "done"}
        <div class="thanks">Done</div>
      {:else }
        <div class="alert">Error</div>
      {/if}
    </td>
  {/if}
</tr>
