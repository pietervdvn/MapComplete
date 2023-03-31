<script lang="ts">
  import { Utils } from "../../../Utils.js";
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import { onDestroy } from "svelte";
  import { Translation } from "../../i18n/Translation";
  import Locale from "../../i18n/Locale";

  export let template: Translation;
  let _template: string
  onDestroy(Locale.language.addCallbackAndRunD(l => {
    _template = template.textFor(l)
  }))
  export let key: string;
  export let tags: UIEventSource<Record<string, string>>;
  let _tags = tags.data;
  onDestroy(tags.addCallbackAndRunD(tags => {
    _tags = tags;
  }));
  let [before, after] = _template.split("{" + key + "}");
</script>

<span>
  {Utils.SubstituteKeys(before, _tags)}
  <slot />
  {Utils.SubstituteKeys(after, _tags)}
</span>
