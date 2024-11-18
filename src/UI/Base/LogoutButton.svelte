<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Translations from "../i18n/Translations"
  import Tr from "./Tr.svelte"
  import ArrowRightOnRectangle from "@babeard/svelte-heroicons/solid/ArrowRightOnRectangle"

  export let osmConnection: OsmConnection
  export let clss = ""
</script>

<button
  class={clss}
  on:click={() => {
    osmConnection.LogOut()
  }}
>
  <ArrowRightOnRectangle class="h-6 max-h-full w-6" />
  <Tr t={Translations.t.general.logout} />
</button>
