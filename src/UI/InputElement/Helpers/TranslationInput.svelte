<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LanguageUtils from "../../../Utils/LanguageUtils"
  import { createEventDispatcher, onDestroy } from "svelte"
  import ValidatedInput from "../ValidatedInput.svelte"
  import { del } from "idb-keyval"

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
  /**
   * Mostly the same as currentVal, but might be the empty string as well
   */
  const currentValRaw = new UIEventSource<string>("")

  let dispatch = createEventDispatcher<{ submit }>()

  function update() {
    let v = currentValRaw.data
    const l = currentLang.data
    console.log("Updating translation input for value", v, " and language", l)
    if (<any>translations.data === "" || translations.data === undefined) {
      translations.data = {}
    }
    if (v === "") {
      delete translations.data[l]
      translations.ping()
      return
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
      if (translations.data[currentLang] === "") {
        delete translations.data[currentLang]
      }
      currentVal.setData(translations.data[currentLang] ?? "")
      currentValRaw.setData(translations.data[currentLang])
    })
  )

  onDestroy(
    currentValRaw.addCallbackAndRunD(() => {
      update()
    })
  )
</script>

<div class="flex flex-col gap-y-1">
  <div class="interactive m-1 mt-2 flex space-x-1 font-bold">
    <span>
      {prefix}
    </span>
    <select bind:value={$currentLang}>
      {#each allLanguages as language}
        <option value={language}>
          {language}
          {#if $translations?.[language] !== undefined}
            *
          {/if}
        </option>
      {/each}
    </select>
    <ValidatedInput
      type="string"
      cls="w-full"
      value={currentVal}
      unvalidatedText={currentValRaw}
      on:submit={() => dispatch("submit")}
    />
    <span>
      {postfix}
    </span>
  </div>
  You have currently set translations for
  <ul>
    {#each Object.keys($translations) as l}
      <li>
        <button class="small" on:click={() => currentLang.setData(l)}>
          <b>{l}:</b>
          {$translations[l]}
        </button>
      </li>
    {/each}
  </ul>
</div>
