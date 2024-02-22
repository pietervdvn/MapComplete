<script lang="ts">
  /**
   * The 'languageQuestion' is a special element which asks about the (possible) languages of a feature
   * (e.g. which speech output an ATM has, in what language(s) the braille writing is or what languages are spoken at a school)
   *
   * This is written into a `key`.
   *
   */
  import { Translation } from "../../i18n/Translation"
  import SpecialTranslation from "../TagRendering/SpecialTranslation.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Store } from "../../../Logic/UIEventSource"
  import { UIEventSource } from "../../../Logic/UIEventSource"

  import type { Feature } from "geojson"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import LanguageOptions from "./LanguageOptions.svelte"
  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"
  import { createEventDispatcher } from "svelte"
  import { Tag } from "../../../Logic/Tags/Tag"
  import ChangeTagAction from "../../../Logic/Osm/Actions/ChangeTagAction"
  import { And } from "../../../Logic/Tags/And"

  export let question: string
  export let prefix: string

  export let foundLanguages: Store<string[]>
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  export let feature: Feature
  export let layer: LayerConfig | undefined
  let dispatch = createEventDispatcher<{ save }>()

  let selectedLanguages: UIEventSource<string[]> = new UIEventSource<string[]>([])
  let countries: Store<Set<string>> = tags.mapD(
    (tags) => new Set<string>(tags["_country"]?.toUpperCase()?.split(";") ?? [])
  )
  async function applySelectedLanguages() {
    const selectedLngs = selectedLanguages.data
    const selection: Tag[] = selectedLanguages.data.map((ln) => new Tag(prefix + ln, "yes"))
    if (selection.length === 0) {
      return
    }
    const currentLanguages = foundLanguages.data

    for (const currentLanguage of currentLanguages) {
      if (selectedLngs.indexOf(currentLanguage) >= 0) {
        continue
      }
      // Erase languages that are not spoken anymore
      selection.push(new Tag(prefix + currentLanguage, ""))
    }

    if (state === undefined || state?.featureSwitchIsTesting?.data) {
      for (const tag of selection) {
        tags.data[tag.key] = tag.value
      }
      tags.ping()
    } else if (state.changes) {
      await state.changes.applyAction(
        new ChangeTagAction(tags.data.id, new And(selection), tags.data, {
          theme: state?.layout?.id ?? "unkown",
          changeType: "answer",
        })
      )
    }
    dispatch("save")
  }
</script>

<div class="disable-links interactive border-interactive flex flex-col p-2">
  <div class="interactive justify-between pt-1 font-bold">
    <SpecialTranslation {feature} {layer} {state} t={new Translation({ "*": question })} {tags} />
  </div>
  <LanguageOptions {selectedLanguages} countries={$countries} />

  <div class="flex w-full flex-wrap-reverse justify-end">
    <slot name="cancel-button" />
    <button
      class="primary"
      class:disabled={$selectedLanguages.length === 0}
      on:click={(_) => applySelectedLanguages()}
    >
      <Tr t={Translations.t.general.save} />
    </button>
  </div>
</div>
