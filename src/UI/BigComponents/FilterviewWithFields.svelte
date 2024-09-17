<script lang="ts">
  import FilteredLayer from "../../Models/FilteredLayer"
  import type { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig"
  import Locale from "../i18n/Locale"
  import ValidatedInput from "../InputElement/ValidatedInput.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { onDestroy } from "svelte"
  import { Utils } from "../../Utils"
  import type { ValidatorType } from "../InputElement/Validators"
  import InputHelper from "../InputElement/InputHelper.svelte"
  import { Translation } from "../i18n/Translation"
  import Tr from "../Base/Tr.svelte"

  export let filteredLayer: FilteredLayer
  export let option: FilterConfigOption
  export let id: string
  let parts: ({ message: string } | { subs: string })[]
  let language = Locale.language
  $: {
    const template = option.question.textFor($language)
    parts = Utils.splitIntoSubstitutionParts(template)
  }
  let fieldValues: Record<string, UIEventSource<string>> = {}
  let fieldTypes: Record<string, ValidatorType> = {}
  let appliedFilter = <UIEventSource<string>>filteredLayer.appliedFilters.get(id)
  let initialState: Record<string, string> = JSON.parse(appliedFilter?.data ?? "{}")

  function setFields() {
    const properties: Record<string, string> = {}
    for (const key in fieldValues) {
      const v = fieldValues[key].data
      if (v === undefined) {
        properties[key] = undefined
      } else {
        properties[key] = v
      }
    }
    appliedFilter?.setData(FilteredLayer.fieldsToString(properties))
  }

  let firstValue: UIEventSource<string>
  for (const field of option.fields) {
    // A bit of cheating: the 'parts' will have '}' suffixed for fields
    const src = new UIEventSource<string>(initialState[field.name] ?? "")
    firstValue ??= src
    fieldTypes[field.name] = field.type
    console.log(field.name, "-->", field.type)
    fieldValues[field.name] = src
    onDestroy(
      src.stabilized(200).addCallback(() => {
        setFields()
      })
    )
  }
  let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)
</script>

<div class="low-interaction p-1 rounded-2xl px-3" class:interactive={$firstValue?.length > 0}>
  {#each parts as part, i}
    {#if part["subs"]}
      <!-- This is a field! -->
      <span class="mx-1">
        <InputHelper value={fieldValues[part["subs"]]} type={fieldTypes[part["subs"]]}>
          <ValidatedInput slot="fallback" value={fieldValues[part["subs"]]} type={fieldTypes[part["subs"]]}
                          {feedback} />
        </InputHelper>
      </span>
    {:else}
      {@html part["message"]}
    {/if}
  {/each}
  {#if $feedback}
    <Tr cls="alert" t={$feedback}/>
  {/if}
</div>
