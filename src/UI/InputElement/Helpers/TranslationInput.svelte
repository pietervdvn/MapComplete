<script lang="ts">

  import { UIEventSource } from "../../../Logic/UIEventSource";
  import LanguageUtils from "../../../Utils/LanguageUtils";
  import { createEventDispatcher, onDestroy } from "svelte";
  import ValidatedInput from "../ValidatedInput.svelte";

  export let value: UIEventSource<string> = new UIEventSource<string>("");

  let translations: UIEventSource<Record<string, string>> = value.sync((s) => {
    try {
      return JSON.parse(s);
    } catch (e) {
      return {};
    }
  }, [], v => JSON.stringify(v));

  const allLanguages: string[] = LanguageUtils.usedLanguagesSorted;
  let currentLang = new UIEventSource("en");
  const currentVal = new UIEventSource<string>("");
  let dispatch = createEventDispatcher<{ submit }>()

  function update() {
    const v = currentVal.data;
    const l = currentLang.data;
    if (translations.data[l] === v) {
      return;
    }
    translations.data[l] = v;
    translations.ping();
  }

  onDestroy(currentLang.addCallbackAndRunD(currentLang => {
    console.log("Applying current lang:", currentLang);
    translations.data[currentLang] = translations.data[currentLang] ?? "";
    currentVal.setData(translations.data[currentLang]);
  }));


  onDestroy(currentVal.addCallbackAndRunD(v => {
    update();
  }));

</script>
<div class="flex">
  <select bind:value={$currentLang}>
    {#each allLanguages as language}
      <option value={language}>
        {language}
      </option>
    {/each}
  </select>
  <ValidatedInput type="string" value={currentVal} on:submit={() => dispatch("submit")} />
</div>
