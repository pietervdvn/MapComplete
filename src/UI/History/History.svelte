<script lang="ts">
  /**
   * Shows a history of the object which focuses on changes made by a certain username
   */
  import type { OsmId } from "../../Models/OsmFeature"
  import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"
  import { HistoryUtils } from "./HistoryUtils"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import DefaultIcon from "../Map/DefaultIcon.svelte"

  export let onlyShowChangesBy: string[]
  export let id: OsmId

  let usernames = new Set(onlyShowChangesBy)
  let fullHistory = UIEventSource.FromPromise(new OsmObjectDownloader().downloadHistory(id))

  let partOfLayer = fullHistory.mapD((history) =>
    history.map((step) => ({
      step,
      layer: HistoryUtils.determineLayer(step.tags),
    }))
  )
  let filteredHistory = partOfLayer.mapD((history) =>
    history
      .filter(({ step }) => {
        if (usernames.size == 0) {
          return true
        }
        console.log(
          "Checking if",
          step.tags["_last_edit:contributor"],
          "is contained in",
          onlyShowChangesBy,
          usernames.has(step.tags["_last_edit:contributor"])
        )
        return usernames.has(step.tags["_last_edit:contributor"])
      })
      .map(({ step, layer }) => {
        const diff = HistoryUtils.tagHistoryDiff(step, fullHistory.data)
        return { step, layer, diff }
      })
  )

  let lastStep = filteredHistory.mapD((history) => history.at(-1))
  let allGeometry = filteredHistory.mapD((all) => !all.some((x) => x.diff.length > 0))
  /**
   * These layers are only shown if there are tag changes as well
   */
  const ignoreLayersIfNoChanges: ReadonlySet<string> = new Set(["walls_and_buildings"])
  const t = Translations.t.inspector
</script>

{#if !$allGeometry || !ignoreLayersIfNoChanges.has($lastStep?.layer?.id)}
  {#if $lastStep?.layer}
    <a href={"https://openstreetmap.org/" + $lastStep.step.tags.id} target="_blank">
      <h3 class="flex items-center gap-x-2">
        <div class="inline-block h-8 w-8 shrink-0">
          <DefaultIcon layer={$lastStep.layer} />
        </div>
        <Tr
          t={$lastStep.layer?.title?.GetRenderValue($lastStep.step.tags)?.Subs($lastStep.step.tags)}
        />
      </h3>
    </a>
  {/if}

  {#if !$filteredHistory}
    <Loading>Loading history...</Loading>
  {:else if $filteredHistory.length === 0}
    <Tr t={t.onlyGeometry} />
  {:else}
    <table class="m-1 w-full">
      {#each $filteredHistory as { step, layer }}
        {#if step.version === 1}
          <tr>
            <td colspan="3">
              <h3>
                <Tr t={t.createdBy.Subs({ contributor: step.tags["_last_edit:contributor"] })} />
              </h3>
            </td>
          </tr>
        {/if}
        {#if HistoryUtils.tagHistoryDiff(step, $fullHistory).length === 0}
          <tr>
            <td class="flex w-full justify-center font-bold" colspan="3">
              <Tr t={t.onlyGeometry} />
            </td>
          </tr>
        {:else}
          {#each HistoryUtils.tagHistoryDiff(step, $fullHistory) as diff}
            <tr>
              <td>
                <a
                  href={"https://osm.org/changeset/" + step.tags["_last_edit:changeset"]}
                  target="_blank"
                >
                  {step.version}
                </a>
              </td>
              <td>{layer?.id ?? "Unknown layer"}</td>
              {#if diff.oldValue === undefined}
                <td>{diff.key}</td>
                <td>{diff.value}</td>
              {:else if diff.value === undefined}
                <td>{diff.key}</td>
                <td class="line-through">{diff.value}</td>
              {:else}
                <td>{diff.key}</td>
                <td>
                  <span class="line-through">{diff.oldValue}</span>
                  → {diff.value}
                </td>
              {/if}
            </tr>
          {/each}
        {/if}
      {/each}
    </table>
  {/if}
{/if}
