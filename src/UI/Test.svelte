<script lang="ts">
  // Testing grounds
  import LanguagePicker from "./InputElement/LanguagePicker.svelte";
  import Translations from "./i18n/Translations";
  import Tr from "./Base/Tr.svelte";
  import Locale from "./i18n/Locale";
  let language = Locale.language
</script>

<div class="w-full">
<LanguagePicker preferredLanguages={["nl", "en"]}/>

<Tr t={Translations.t.general.download.downloadAsPdf}/>
  {$language}
</div>
