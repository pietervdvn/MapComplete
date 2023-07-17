<script lang="ts">
  /**
   * Constructs an input helper element for the given type.
   * Note that all values are stringified
   */

  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { ValidatorType } from "./Validators"
  import InputHelpers from "./InputHelpers"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import type { Feature } from "geojson"
  import BaseUIElement from "../BaseUIElement"
  import { VariableUiElement } from "../Base/VariableUIElement"

  export let type: ValidatorType
  export let value: UIEventSource<string>

  export let feature: Feature
  export let args: (string | number | boolean)[] = undefined

  let properties = { feature, args: args ?? [] }
  let construct = new UIEventSource<(value, extraProperties) => BaseUIElement>(undefined)
  $: {
    construct.setData(InputHelpers.AvailableInputHelpers[type])
  }
</script>

{#if construct !== undefined}
  <ToSvelte
    construct={() =>
      new VariableUiElement(construct.mapD((construct) => construct(value, properties)))}
  />
{/if}
