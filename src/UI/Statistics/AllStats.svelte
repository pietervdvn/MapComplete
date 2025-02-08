<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Utils } from "../../Utils"
  import Loading from "../Base/Loading.svelte"
  import type { FeatureCollection } from "geojson"
  import type { ChangeSetData } from "./ChangesetsOverview"
  import { ChangesetsOverview } from "./ChangesetsOverview"

  import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
  import mcChanges from "../../../public/assets/generated/themes/mapcomplete-changes.json"
  import type { ThemeConfigJson } from "../../Models/ThemeConfig/Json/ThemeConfigJson"
  import { Accordion, AccordionItem } from "flowbite-svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import Filterview from "../BigComponents/Filterview.svelte"
  import FilteredLayer from "../../Models/FilteredLayer"
  import type { OsmFeature } from "../../Models/OsmFeature"
  import SingleStat from "./SingleStat.svelte"
  import { DownloadIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import Filter from "../../assets/svg/Filter.svelte"

  export let paths: string[]

  let downloaded = 0
  const layer = new ThemeConfig(<ThemeConfigJson>mcChanges, true).layers[0]
  const filteredLayer = new FilteredLayer(layer)

  const downloadData: () => Promise<(ChangeSetData & OsmFeature)[]> = async () => {
    const results = []
    for (const p of paths) {
      const r = await Utils.downloadJson<FeatureCollection>(p)
      console.log("Downloaded", p)
      downloaded++
      if (Array.isArray(r)) {
        results.push(...r)
      } else {
        results.push(...r.features ?? [])
      }
    }
    return results
  }

  let allData = <UIEventSource<(ChangeSetData & OsmFeature)[]>>UIEventSource.FromPromise(downloadData())

  let overview: Store<ChangesetsOverview | undefined> = allData.mapD(
    (data) =>
      ChangesetsOverview.fromDirtyData(data).filter((cs) =>
        filteredLayer.isShown(<any>cs.properties)
      ),
    [filteredLayer.currentFilter]
  )

  const trs = layer.tagRenderings
    .filter((tr) => tr.mappings?.length > 0 || tr.freeform?.key !== undefined)
    .filter((tr) => tr.question !== undefined)

  let diffInDays = overview.mapD((overview) => {
    const dateStrings = Utils.NoNull(overview._meta.map((cs) => cs.properties.date))
    const dates: number[] = dateStrings.map((d) => new Date(d).getTime())
    const mindate = Math.min(...dates)
    const maxdate = Math.max(...dates)
    return (maxdate - mindate) / (1000 * 60 * 60 * 24)
  })

  function offerAsDownload() {
    const data = GeoOperations.toCSV($overview._meta, {
      ignoreTags: /^((deletion:node)|(import:node)|(move:node)|(soft-delete:))/
    })
    Utils.offerContentsAsDownloadableFile(data, "statistics.csv", {
      mimetype: "text/csv"
    })
  }
</script>

{#if downloaded < paths.length}
  <Loading>Loaded {downloaded} out of {paths.length}</Loading>
{:else}
  <AccordionSingle>
    <div slot="header" class="flex items-center">
      <Filter class="h-6 w-6 pr-2" />
      Filters
    </div>
    <Filterview {filteredLayer} state={undefined} showLayerTitle={false} />
  </AccordionSingle>
  {#if !$overview || $overview._meta.length === 0}
    <div class="alert">Filter matches no items</div>
  {:else}
    <Accordion>
      {#each trs as tr}
        <AccordionItem paddingDefault="p-0" inactiveClass="text-black">
        <span slot="header" class={"w-full p-2 text-base"}>
          {tr.question ?? tr.id}
        </span>
          <SingleStat {tr} overview={$overview} diffInDays={$diffInDays} />
        </AccordionItem>
      {/each}
    </Accordion>
    <button on:click={() => offerAsDownload()}>
      <DownloadIcon class="h-6 w-6" />
      Download as CSV
    </button>
  {/if}
{/if}
