<script lang="ts">
  /**
   * Shows the statistics for a single item
   */
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import TagRenderingChart, { StackedRenderingChart } from "../BigComponents/TagRenderingChart"
  import { ChangesetsOverview } from "./ChangesetsOverview"

  export let overview: ChangesetsOverview
  export let diffInDays: number
  export let tr: TagRenderingConfig

  let total: number = undefined
  if (tr.freeform?.key !== undefined) {
    total = new Set(overview._meta.map((f) => f.properties[tr.freeform.key])).size
  }
</script>

{#if total > 1}
  {total} unique values
{/if}
<h3>By number of changesets</h3>

<div class="flex">
  <ToSvelte
    construct={new TagRenderingChart(overview._meta, tr, {
      groupToOtherCutoff: total > 50 ? 25 : total > 10 ? 3 : 0,
      chartstyle: "width: 24rem; height: 24rem",
      chartType: "doughnut",
      sort: true,
    })}
  />
</div>

<ToSvelte
  construct={new StackedRenderingChart(tr, overview._meta, {
    period: diffInDays <= 367 ? "day" : "month",
    groupToOtherCutoff: total > 50 ? 25 : total > 10 ? 3 : 0,
  })}
/>

<h3>By number of modifications</h3>
<ToSvelte
  construct={new StackedRenderingChart(tr, overview._meta, {
    period: diffInDays <= 367 ? "day" : "month",
    groupToOtherCutoff: total > 50 ? 10 : 0,
    sumFields: ChangesetsOverview.valuesToSum,
  })}
/>
