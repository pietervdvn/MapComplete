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

  export let value: UIEventSource<string>
  export let config: TagRenderingConfig
  export let tags: UIEventSource<Record<string, string>>

  export let feature: Feature = undefined
  export let unit: Unit | undefined

  let placeholder = config.freeform?.placeholder
  let inline = config.freeform?.inline
  $: {
    placeholder = config.freeform?.placeholder
    inline = false
    inline = config.freeform?.inline
  }

  export let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)

  let dispatch = createEventDispatcher<{ selected }>()
  onDestroy(
    value.addCallbackD(() => {
      dispatch("selected")
    })
  )

  function getCountry() {
    return tags.data["_country"]
  }
</script>

<div class="inline-flex flex-col w-full">
  {#if inline}
    <Inline key={config.freeform.key} {tags} template={config.render}>
      <ValidatedInput
        {feedback}
        {getCountry}
        {unit}
        on:selected={() => dispatch("selected")}
        type={config.freeform.type}
        {placeholder}
        {value}
      />
    </Inline>
  {:else}
    <ValidatedInput
      {feedback}
      {getCountry}
      {unit}
      on:selected={() => dispatch("selected")}
      type={config.freeform.type}
      {placeholder}
      {value}
    />
  {/if}

  <InputHelper args={config.freeform.helperArgs} {feature} type={config.freeform.type} {value} />
</div>
