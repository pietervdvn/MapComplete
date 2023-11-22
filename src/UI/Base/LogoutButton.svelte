<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection";
  import Logout from "../../assets/svg/Logout.svelte";
  import Translations from "../i18n/Translations";
  import Tr from "./Tr.svelte";

  export let osmConnection: OsmConnection;
</script>

<button on:click={() => {osmConnection.LogOut()}}>
  <Logout class="w-6 h-6" />
  <Tr t={Translations.t.general.logout} />
</button>
