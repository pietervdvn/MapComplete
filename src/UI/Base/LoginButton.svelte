<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Translations from "../i18n/Translations.js"
  import Tr from "./Tr.svelte"
  import ArrowLeftOnRectangle from "@babeard/svelte-heroicons/solid/ArrowLeftOnRectangle"

  export let osmConnection: OsmConnection
  export let clss: string | undefined = undefined

  if (osmConnection === undefined) {
    console.error("No osmConnection passed into loginButton")
  }
  let isLoggedIn = osmConnection.isLoggedIn
</script>

{#if !$isLoggedIn}
  <button class={clss} on:click={() => osmConnection.AttemptLogin()} style="margin-left: 0">
    <ArrowLeftOnRectangle class="m-1 w-12" />
    <slot>
      <Tr t={Translations.t.general.loginWithOpenStreetMap} />
    </slot>
  </button>
{/if}
