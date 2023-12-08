<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Translations from "../i18n/Translations.js"
  import Tr from "./Tr.svelte"
  import ToSvelte from "./ToSvelte.svelte"
  import Svg from "../../Svg"

  export let osmConnection: OsmConnection
  export let clss: string | undefined = undefined
</script>

<button class={clss} on:click={() => osmConnection.AttemptLogin()}>
  <ToSvelte construct={Svg.login_svg().SetClass("w-12 m-1")} />
  <slot>
    <Tr t={Translations.t.general.loginWithOpenStreetMap} />
  </slot>
</button>
