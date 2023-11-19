<script lang="ts">
  // Testing grounds
  import LanguagePicker from "./InputElement/LanguagePicker.svelte";
  import Translations from "./i18n/Translations";
  import Tr from "./Base/Tr.svelte";
  import Locale from "./i18n/Locale";
  import MarkAsFavourite from "./Popup/MarkAsFavourite.svelte";
  let language = Locale.language
</script>

<MarkAsFavourite/>
