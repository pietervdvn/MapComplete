<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection";
  import SubtleButton from "./SubtleButton.svelte";
  import Translations from "../i18n/Translations.js";
  import Tr from "./Tr.svelte";

  export let osmConnection: OsmConnection
</script>

<SubtleButton on:click={() => osmConnection.AttemptLogin()}>
  <img slot="image" src="./assets/svg/login.svg" class="w-8"/>
  <slot name="message" slot="message">
    <Tr  t={Translations.t.general.loginWithOpenStreetMap}/>
  </slot>
</SubtleButton>
