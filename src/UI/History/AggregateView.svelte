<script lang="ts">
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
  import { OsmObject } from "../../Logic/Osm/OsmObject"
  import Loading from "../Base/Loading.svelte"
  import { HistoryUtils } from "./HistoryUtils"
  import * as shared_questions from "../../assets/generated/layers/questions.json"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import Tr from "../Base/Tr.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import Translations from "../i18n/Translations"

  export let onlyShowUsername: string[]
  export let features: Feature[]

  let usernames = new Set(onlyShowUsername)

  const downloader = new OsmObjectDownloader()
  let allHistories: UIEventSource<OsmObject[][]> = UIEventSource.FromPromise(
    Promise.all(features.map((f) => downloader.downloadHistory(f.properties.id)))
  )
  let allDiffs: Store<
    {
      key: string
      value?: string
      oldValue?: string
    }[]
  > = allHistories.mapD((histories) => HistoryUtils.fullHistoryDiff(histories, usernames))

  const trs = shared_questions.tagRenderings.map((tr) => new TagRenderingConfig(tr))

  function detectQuestion(key: string): TagRenderingConfig {
    return trs.find((tr) => tr.freeform?.key === key)
  }

  const mergedCount: Store<
    {
      key: string
      tr: TagRenderingConfig
      count: number
      values: { value: string; count: number }[]
    }[]
  > = allDiffs.mapD((allDiffs) => {
    const keyCounts = new Map<string, Map<string, number>>()
    for (const diff of allDiffs) {
      const k = diff.key
      if (!keyCounts.has(k)) {
        keyCounts.set(k, new Map<string, number>())
      }
      const valueCounts = keyCounts.get(k)
      const v = diff.value ?? ""
      valueCounts.set(v, 1 + (valueCounts.get(v) ?? 0))
    }

    const perKey: {
      key: string
      tr: TagRenderingConfig
      count: number
      values: { value: string; count: number }[]
    }[] = []
    keyCounts.forEach((values, key) => {
      const keyTotal: { value: string; count: number }[] = []
      values.forEach((count, value) => {
        keyTotal.push({ value, count })
      })
      let countForKey = 0
      for (const { count } of keyTotal) {
        countForKey += count
      }
      keyTotal.sort((a, b) => b.count - a.count)
      const tr = detectQuestion(key)
      perKey.push({ count: countForKey, tr, key, values: keyTotal })
    })
    perKey.sort((a, b) => b.count - a.count)

    return perKey
  })

  const t = Translations.t.inspector
</script>

{#if allHistories === undefined}
  <Loading />
{:else if $allDiffs !== undefined}
  {#each $mergedCount as diff}
    <h3>
      {#if diff.tr}
        <Tr t={diff.tr.question} />
      {:else}
        {diff.key}
      {/if}
    </h3>
    <AccordionSingle>
      <span slot="header">
        <Tr t={t.answeredCountTimes.Subs(diff)} />
      </span>
      <ul>
        {#each diff.values as value}
          <li>
            <b>{value.value}</b>
            {#if value.count > 1}
              - {value.count}
            {/if}
          </li>
        {/each}
      </ul>
    </AccordionSingle>
  {/each}
{/if}
