<script lang="ts">
  import { Translation } from "./i18n/Translation"
  import LanguagePicker from "./InputElement/LanguagePicker.svelte"
  import Tr from "./Base/Tr.svelte"
  import ToSvelte from "./Base/ToSvelte.svelte"

  const m = new Map<string, string>()
  m.set("nl", "Nederlands")
  const tr = Translation.fromMap(m, true)
</script>

<LanguagePicker/>
<h1>Svelte native</h1>
<Tr t={tr}/>
<h1>ToSvelte</h1>
<ToSvelte construct={tr}/>
