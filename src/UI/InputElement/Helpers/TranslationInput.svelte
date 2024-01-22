<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LanguageUtils from "../../../Utils/LanguageUtils"
  import { createEventDispatcher, onDestroy } from "svelte"
  import ValidatedInput from "../ValidatedInput.svelte"

  export let value: UIEventSource<Record<string, string>> = new UIEventSource<
    Record<string, string>
  >({})

  export let args: string[] = []

  let prefix = args[0] ?? ""
  let postfix = args[1] ?? ""

  let translations: UIEventSource<Record<string, string>> = value

  const allLanguages: string[] = LanguageUtils.usedLanguagesSorted
  let currentLang = new UIEventSource("en")
  const currentVal = new UIEventSource<string>("")
  let dispatch = createEventDispatcher<{ submit }>()

  function update() {
    const v = currentVal.data
    const l = currentLang.data
    if (translations.data === "" || translations.data === undefined) {
      translations.data = {}
    }
    if (translations.data[l] === v) {
      return
    }
    translations.data[l] = v
    translations.ping()
  }

  onDestroy(
    currentLang.addCallbackAndRunD((currentLang) => {
      if (!translations.data) {
        translations.data = {}
      }
      translations.data[currentLang] = translations.data[currentLang] ?? ""
      currentVal.setData(translations.data[currentLang])
    })
  )

  onDestroy(
    currentVal.addCallbackAndRunD((v) => {
      update()
    })
  )
</script>

<div class="interactive m-1 mt-2 flex space-x-1 font-bold">
  <span>
    {prefix}
  </span>
  <select bind:value={$currentLang}>
    {#each allLanguages as language}
      <option value={language}>
        {language}
      </option>
    {/each}
  </select>
  <ValidatedInput
    type="string"
    cls="w-full"
    value={currentVal}
    on:submit={() => dispatch("submit")}
  />
  <span>
    {postfix}
  </span>
</div>
