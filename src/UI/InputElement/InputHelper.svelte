<script lang="ts">
  /**
   * Constructs an input helper element for the given type.
   * Note that all values are stringified
   */

  import { UIEventSource } from "../../Logic/UIEventSource";
  import type { ValidatorType } from "./Validators";
  import InputHelpers from "./InputHelpers";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import type { Feature } from "geojson";
  import BaseUIElement from "../BaseUIElement";
  import { VariableUiElement } from "../Base/VariableUIElement";
  import { createEventDispatcher } from "svelte";
  import ImageHelper from "./Helpers/ImageHelper.svelte";
  import TranslationInput from "./Helpers/TranslationInput.svelte";
  import TagInput from "./Helpers/TagInput.svelte";
  import SimpleTagInput from "./Helpers/SimpleTagInput.svelte";
  import DirectionInput from "./Helpers/DirectionInput.svelte";
  import DateInput from "./Helpers/DateInput.svelte";
  import ColorInput from "./Helpers/ColorInput.svelte";

  export let type: ValidatorType;
  export let value: UIEventSource<string>;

  export let feature: Feature;
  export let args: (string | number | boolean)[] = undefined;

  let properties = { feature, args: args ?? [] };
  let construct = new UIEventSource<(value, extraProperties) => BaseUIElement>(undefined);
  $: {
    const helper = InputHelpers.AvailableInputHelpers[type];
    construct.setData(helper);
  }
  let dispatch = createEventDispatcher<{ selected, submit }>();

</script>

{#if type === "translation" }
  <TranslationInput {value} on:submit={() => dispatch("submit")} />
{:else if type === "direction"}
  <DirectionInput {value} mapProperties={InputHelpers.constructMapProperties(properties)} />
{:else if type === "date"}
  <DateInput { value } />
{:else if type === "color"}
  <ColorInput { value } />
{:else if type === "image"}
  <ImageHelper { value } />
{:else if type === "tag"}
  <TagInput { value } />
{:else if type === "simple_tag"}
  <SimpleTagInput { value } />

{:else if $construct !== undefined}
  {#if isBaseUIElement}
    <ToSvelte
      construct={() =>
      new VariableUiElement(construct.mapD((construct) => construct(value, properties)))}
    />

  {/if}
{/if}
