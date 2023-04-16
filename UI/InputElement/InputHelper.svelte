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

  export let type: ValidatorType;
  export let value: UIEventSource<string>;
  
  export let feature: Feature;
  export let args: (string | number | boolean)[] = undefined;
  
  let properties = { feature, args: args ?? [] };
  let construct = InputHelpers.AvailableInputHelpers[type];

</script>

{#if construct !== undefined}
  <ToSvelte construct={() => construct(value, properties)} />
{/if}
