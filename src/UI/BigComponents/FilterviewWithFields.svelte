<script lang="ts">
  import FilteredLayer from "../../Models/FilteredLayer"
  import type { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig"
  import Locale from "../i18n/Locale"
  import ValidatedInput from "../InputElement/ValidatedInput.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { onDestroy } from "svelte"
  import { Utils } from "../../Utils"
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
  let fieldTypes: Record<string, string> = {}
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

  for (const field of option.fields) {
    // A bit of cheating: the 'parts' will have '}' suffixed for fields
    const src = new UIEventSource<string>(initialState[field.name] ?? "")
    fieldTypes[field.name] = field.type
    fieldValues[field.name] = src
    onDestroy(
      src.stabilized(200).addCallback(() => {
        setFields()
      })
    )
  }
</script>

<div>
  {#each parts as part, i}
    {#if part.subs}
      <!-- This is a field! -->
      <span class="mx-1">
        <ValidatedInput value={fieldValues[part.subs]} type={fieldTypes[part.subs]} />
      </span>
    {:else}
      {part.message}
    {/if}
  {/each}
</div>
