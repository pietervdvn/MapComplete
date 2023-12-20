<script lang="ts">
  import PrivacyPolicy from "./BigComponents/PrivacyPolicy.svelte"
  import Tr from "./Base/Tr.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Translations from "./i18n/Translations"
  import { Utils } from "../Utils"
  import Add from "../assets/svg/Add.svelte"
</script>

<div class="flex flex-col p-4 h-screen overflow-hidden">
  <h2 class="flex items-center">
    <EyeIcon class="w-6 pr-2" />
    <Tr t={Translations.t.privacy.title} />
  </h2>
  <div class="overflow-auto h-full border border-gray-500 p-4">
    <PrivacyPolicy />
  </div>
  <a class="flex button" href={Utils.HomepageLink()}>
    <Add class="h-6 w-6" />
    <Tr t={Translations.t.general.backToIndex} />
  </a>
</div>
