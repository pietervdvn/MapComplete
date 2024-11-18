<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
  import { Utils } from "../../Utils"
  import ThemesList from "./ThemesList.svelte"
  import Translations from "../i18n/Translations"
  import UserRelatedState from "../../Logic/State/UserRelatedState"
  import Tr from "../Base/Tr.svelte"

  export let search: UIEventSource<string>
  export let state: UserRelatedState & {
    osmConnection: OsmConnection
  }

  let customThemes
</script>
