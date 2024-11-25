<script lang="ts">
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
  import { OsmObject } from "../../Logic/Osm/OsmObject"
  import Loading from "../Base/Loading.svelte"
  import { HistoryUtils } from "./HistoryUtils"

  export let onlyShowUsername: string
  export let features: Feature[]

  const downloader = new OsmObjectDownloader()
  let allHistories: UIEventSource<OsmObject[][]> = UIEventSource.FromPromise(
    Promise.all(features.map(f => downloader.downloadHistory(f.properties.id)))
  )
  let allDiffs: Store<{ key: string; value?: string; oldValue?: string }[]> = allHistories.mapD(histories => {
    const allDiffs = [].concat(...histories.map(
      history => {
        const filtered = history.filter(step => !onlyShowUsername || step.tags["_last_edit:contributor"] === onlyShowUsername)
        const diffs: {
          key: string;
          value?: string;
          oldValue?: string
        }[][] = filtered.map(step => HistoryUtils.tagHistoryDiff(step, history))
        return [].concat(...diffs)
      }
    ))
    return allDiffs
  })

  const mergedCount = allDiffs.mapD(allDiffs => {
    const keyCounts = new Map<string, Map<string, number>>()
    for (const diff of allDiffs) {
      const k = diff.key
      if(!keyCounts.has(k)){
        keyCounts.set(k, new Map<string, number>())
      }
      const valueCounts = keyCounts.get(k)
      const v = diff.value ?? ""
      valueCounts.set(v, 1 + (valueCounts.get(v) ?? 0))
    }

    const perKey: {key: string, count: number, values:
        {value: string, count: number}[]
    }[] = []
    keyCounts.forEach((values, key) => {
      const keyTotal :   {value: string, count: number}[] = []
      values.forEach((count, value) => {
        keyTotal.push({value, count})
      })
      let countForKey = 0
      for (const {count} of keyTotal) {
        countForKey += count
      }
      keyTotal.sort((a, b) => b.count - a.count)
      perKey.push({count: countForKey, key, values: keyTotal})
    })
    perKey.sort((a, b) => b.count - a.count)

    return perKey
  })

</script>

{#if allHistories === undefined}
  <Loading />
{:else if $allDiffs !== undefined}
  {#each $mergedCount as diff}
    <div class="m-1 border-black border p-1">
      {JSON.stringify(diff)}
    </div>
  {/each}
{/if}
