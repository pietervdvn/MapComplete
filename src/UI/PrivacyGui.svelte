<script lang="ts">
  import PrivacyPolicy from "./BigComponents/PrivacyPolicy.svelte"
  import Tr from "./Base/Tr.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Translations from "./i18n/Translations"
  import { Utils } from "../Utils"
  import Add from "../assets/svg/Add.svelte"
  import LanguagePicker from "./InputElement/LanguagePicker.svelte"
</script>

<div class="flex h-screen flex-col overflow-hidden px-4">
  <div class="flex justify-between">
    <h2 class="flex items-center">
      <EyeIcon class="w-6 pr-2" />
      <Tr t={Translations.t.privacy.title} />
    </h2>
    <LanguagePicker availableLanguages={Translations.t.privacy.intro.SupportedLanguages()} />
  </div>
  <div class="h-full overflow-auto border border-gray-500 p-4">
    <PrivacyPolicy />
  </div>
  <a class="button flex" href={Utils.HomepageLink()}>
    <Add class="h-6 w-6" />
    <Tr t={Translations.t.general.backToIndex} />
  </a>
</div>
