<script lang="ts">
  import PrivacyPolicy from "./BigComponents/PrivacyPolicy.svelte"
  import Tr from "./Base/Tr.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Translations from "./i18n/Translations"
  import { Utils } from "../Utils"
  import Add from "../assets/svg/Add.svelte"
  import LanguagePicker from "./InputElement/LanguagePicker.svelte"
  import type { SpecialVisualizationState } from "./SpecialVisualization"
  import { OsmConnection } from "../Logic/Osm/OsmConnection"
  import UserRelatedState from "../Logic/State/UserRelatedState"
  import Title from "./Popup/Title.svelte"
  import TitledPanel from "./Base/TitledPanel.svelte"
  import Back from "../assets/svg/Back.svelte"

  const osmConnection = new OsmConnection()
  let state: SpecialVisualizationState = {
    osmConnection,
    userRelatedState: new UserRelatedState(osmConnection)
  }
</script>

<main class="h-screen">
  <TitledPanel>
    <a slot="title-start" class="button p-0" style="padding:0" href="..">
      <Back class="w-6 h-6 m-2" />
    </a>
    <div slot="title" class="flex items-center">
      <EyeIcon class="w-6 pr-2" />
      <Tr t={Translations.t.privacy.title} />
    </div>

    <LanguagePicker slot="title-end" availableLanguages={Translations.t.privacy.intro.SupportedLanguages()} />
    <PrivacyPolicy {state} />
  </TitledPanel>

</main>
