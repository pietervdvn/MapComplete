<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { Utils } from "../../Utils"
  import Loading from "../Base/Loading.svelte"
  import AllStats from "./AllStats.svelte"
  import TitledPanel from "../Base/TitledPanel.svelte"

  let homeUrl =
    "https://data.mapcomplete.org/changeset-metadata/"
  let stats_files = "file-overview.json"

  let indexFile = UIEventSource.FromPromise(Utils.downloadJson<string[]>(homeUrl + stats_files))
  let prefix = /^stats.202[45]/
  let filteredIndex = indexFile.mapD(index => index.filter(path => path.match(prefix)))
  filteredIndex.addCallbackAndRunD(filtered => console.log("Filtered items are", filtered, indexFile.data))
</script>

<main class="h-screen">

  <TitledPanel>
    <div slot="title" class="flex w-full justify-between">
      <span>Statistics of changes made with MapComplete</span>
    </div>
    <a slot="title-end" href="/" class="button">Back to index</a>

    {#if $indexFile === undefined}
      <Loading>Loading index file...</Loading>
    {:else}
      <AllStats
        paths={$filteredIndex.map((p) => homeUrl + "/" + p)}
      />
    {/if}
  </TitledPanel>
</main>
