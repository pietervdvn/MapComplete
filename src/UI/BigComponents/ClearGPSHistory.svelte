<script lang="ts">
  import Trash from "@babeard/svelte-heroicons/mini/Trash"
  import { WithSelectedElementState } from "../../Models/ThemeViewState/WithSelectedElementState"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let state: WithSelectedElementState

  function clear() {
    console.log("Clearing history")
    state.historicalUserLocations.features.setData([])
    state.selectedElement.setData(undefined)
  }
</script>


<button on:click={() => clear()}>
  <Trash class="w-6 h-6" />
  <Tr t={Translations.t.general.removeLocationHistory} />
</button>
