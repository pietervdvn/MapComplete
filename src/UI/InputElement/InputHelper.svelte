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
  import ImageHelper from "./Helpers/ImageHelper.svelte"
  import TranslationInput from "./Helpers/TranslationInput.svelte"
  import TagInput from "./Helpers/TagInput.svelte"
  import SimpleTagInput from "./Helpers/SimpleTagInput.svelte"
  import DirectionInput from "./Helpers/DirectionInput.svelte"
  import DateInput from "./Helpers/DateInput.svelte"
  import ColorInput from "./Helpers/ColorInput.svelte"
  import OpeningHoursInput from "./Helpers/OpeningHoursInput.svelte"
  import SlopeInput from "./Helpers/SlopeInput.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"

  export let type: ValidatorType
  export let value: UIEventSource<string | object>

  export let feature: Feature
  export let args: (string | number | boolean)[] = undefined
  export let state: SpecialVisualizationState

  let properties = { feature, args: args ?? [] }
</script>

{#if type === "translation"}
  <TranslationInput {value} on:submit {args} />
{:else if type === "direction"}
  <DirectionInput {value} mapProperties={InputHelpers.constructMapProperties(properties)} />
{:else if type === "date"}
  <DateInput {value} />
{:else if type === "color"}
  <ColorInput {value} />
{:else if type === "image"}
  <ImageHelper {value} />
{:else if type === "tag"}
  <TagInput {value} on:submit />
{:else if type === "simple_tag"}
  <SimpleTagInput {value} {args} on:submit />
{:else if type === "opening_hours"}
  <OpeningHoursInput {value} />
{:else if type === "slope"}
  <SlopeInput {value} {feature} {state} />
{:else if type === "wikidata"}
  <ToSvelte construct={() => InputHelpers.constructWikidataHelper(value, properties)} />
{/if}
