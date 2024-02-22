<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Translations from "../i18n/Translations.js"
  import Tr from "./Tr.svelte"
  import Login from "../../assets/svg/Login.svelte"

  export let osmConnection: OsmConnection
  export let clss: string | undefined = undefined
</script>

<button class={clss} on:click={() => osmConnection.AttemptLogin()} style="margin-left: 0">
  <Login class="m-1 w-12" />
  <slot>
    <Tr t={Translations.t.general.loginWithOpenStreetMap} />
  </slot>
</button>
