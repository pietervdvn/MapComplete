<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { HistoryUtils } from "./HistoryUtils"
  import type { Feature } from "geojson"
  import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
  import { OsmObject } from "../../Logic/Osm/OsmObject"
  import Loading from "../Base/Loading.svelte"
  import AttributedPanoramaxImage from "./AttributedPanoramaxImage.svelte"

  export let onlyShowUsername: string[]
  export let features: Feature[]

  const downloader = new OsmObjectDownloader()
  let allHistories: UIEventSource<OsmObject[][]> = UIEventSource.FromPromise(
    Promise.all(features.map(f => downloader.downloadHistory(f.properties.id)))
  )
  let imageKeys = new Set(...["panoramax", "image:streetsign", "image:menu"].map(k => {
    const result: string[] = [k]
    for (let i = 0; i < 10; i++) {
      result.push(k + ":" + i)
    }
    return result
  }))
  let usernamesSet = new Set(onlyShowUsername)
  let allDiffs: Store<{
    key: string;
    value?: string;
    oldValue?: string
  }[]> = allHistories.mapD(histories => HistoryUtils.fullHistoryDiff(histories, usernamesSet))

  let addedImages = allDiffs.mapD(diffs => [].concat(...diffs.filter(({ key }) => imageKeys.has(key))))

</script>
{#if $allDiffs === undefined}
  <Loading />
{:else if $addedImages.length === 0}
  No images added by this contributor
{:else}
  <div class="flex">
    {#each $addedImages as imgDiff}
      <div class="w-48 h-48">
        <AttributedPanoramaxImage hash={imgDiff.value} />
      </div>
    {/each}
  </div>
{/if}
