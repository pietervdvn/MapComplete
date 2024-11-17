<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { Utils } from "../../Utils"
  import Loading from "../Base/Loading.svelte"
  import AllStats from "./AllStats.svelte"

  let homeUrl =
    "https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/changeset-metadata/"
  let stats_files = "file-overview.json"

  let indexFile = UIEventSource.FromPromise(
    Utils.downloadJson<string[]>(homeUrl + stats_files)
  )

</script>

<div class="m-4">
  <div class="flex justify-between">

    <h2>Statistics of changes made with MapComplete</h2>
    <a href="/" class="button">Back to index</a>
  </div>
  {#if $indexFile === undefined}
    <Loading>Loading index file...</Loading>
  {:else}
    <AllStats paths={$indexFile.filter(p => p.startsWith("stats")).map(p => homeUrl+"/"+p)} />
  {/if}

</div>

