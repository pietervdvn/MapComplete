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

  const t = Translations.t.general
  const currentIds: Store<string[]> = state.installedUserThemes
  const stableIds = Stores.ListStabilized<string>(currentIds)
  let customThemes
  $: customThemes = Utils.NoNull($stableIds.map((id) => state.GetUnofficialTheme(id)))
  $: console.log("Custom themes are", customThemes)
</script>

{#if customThemes.length > 0}
  <ThemesList {search} {state} themes={customThemes} isCustom={true} hideThemes={false}>
    <svelte:fragment slot="title">
      <h3>
        <Tr t={t.customThemeTitle} />
      </h3>
      <Tr t={t.customThemeIntro} />
    </svelte:fragment>
  </ThemesList>
{/if}
