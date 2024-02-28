<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import { Translation } from "../../i18n/Translation"
  import ValidatedInput from "../../InputElement/ValidatedInput.svelte"
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig"
  import Inline from "./Inline.svelte"
  import { createEventDispatcher, onDestroy } from "svelte"
  import InputHelper from "../../InputElement/InputHelper.svelte"
  import type { Feature } from "geojson"
  import { Unit } from "../../../Models/Unit"
  import InputHelpers from "../../InputElement/InputHelpers"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"

  export let value: UIEventSource<string>
  export let unvalidatedText: UIEventSource<string> = new UIEventSource<string>(value.data)
  export let config: TagRenderingConfig
  export let tags: UIEventSource<Record<string, string>>

  export let feature: Feature = undefined
  export let state: SpecialVisualizationState
  export let unit: Unit | undefined

  let placeholder = config.freeform?.placeholder
  let inline = config.freeform?.inline
  $: {
    placeholder = config.freeform?.placeholder
    inline = false
    inline = config.freeform?.inline
  }

  const dispatch = createEventDispatcher<{ selected }>()
  export let feedback: UIEventSource<Translation>
  onDestroy(
    value.addCallbackD(() => {
      dispatch("selected")
    })
  )

  function getCountry() {
    return tags.data["_country"]
  }
</script>

<div class="inline-flex w-full flex-col">
  {#if inline}
    <Inline key={config.freeform.key} {tags} template={config.render}>
      <ValidatedInput
        {feedback}
        {getCountry}
        {unit}
        on:selected
        on:submit
        type={config.freeform.type}
        {placeholder}
        {value}
      />
    </Inline>
  {:else if InputHelpers.hideInputField.indexOf(config.freeform.type) < 0}
    <ValidatedInput
      {feedback}
      {getCountry}
      {unit}
      on:selected
      on:submit
      type={config.freeform.type}
      {placeholder}
      {value}
      {unvalidatedText}
    />
  {/if}

  <InputHelper
    args={config.freeform.helperArgs}
    {feature}
    type={config.freeform.type}
    {value}
    {state}
    on:submit
  />
</div>
