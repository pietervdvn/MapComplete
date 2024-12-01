<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { HistoryUtils } from "./HistoryUtils"
  import type { Feature } from "geojson"
  import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
  import { OsmObject } from "../../Logic/Osm/OsmObject"
  import Loading from "../Base/Loading.svelte"
  import AttributedImage from "../Image/AttributedImage.svelte"
  import AttributedPanoramaxImage from "./AttributedPanoramaxImage.svelte"
  import History from "./History.svelte"

  export let onlyShowUsername: string
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
  let allDiffs: Store<{
    key: string;
    value?: string;
    oldValue?: string
  }[]> = allHistories.mapD(histories => HistoryUtils.fullHistoryDiff(histories, onlyShowUsername))

  let addedImages = allDiffs.mapD(diffs => [].concat(...diffs.filter(({ key }) => imageKeys.has(key))))

</script>
{#if $allDiffs === undefined}
  <Loading />
{:else if $addedImages.length === 0}
  No images added by this contributor
{:else}
  {#each $addedImages as imgDiff}
    <AttributedPanoramaxImage hash={imgDiff.value} />
  {/each}
{/if}
