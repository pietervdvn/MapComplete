<script lang="ts">

  import { UIEventSource } from "../../Logic/UIEventSource";
  import type { ValidatorType } from "./Validators";
  import Validators from "./Validators";
  import { ExclamationIcon } from "@rgossiaux/svelte-heroicons/solid";
  import { Translation } from "../i18n/Translation";
  import { createEventDispatcher, onDestroy } from "svelte";
  import {Validator} from "./Validator";

  export let value: UIEventSource<string>;
  // Internal state, only copied to 'value' so that no invalid values leak outside
  let _value = new UIEventSource(value.data ?? "");
  export let type: ValidatorType;
  export let feedback: UIEventSource<Translation> | undefined = undefined;
  export let getCountry: () => string | undefined
  export let placeholder: string | Translation | undefined
  let validator : Validator = Validators.get(type)
  let _placeholder = placeholder ?? validator?.getPlaceholder() ?? type
  
  $: {
    // The type changed -> reset some values
    validator = Validators.get(type)
    _value.setData(value.data ?? "")
    console.log("REseting validated input, _value is ", _value.data, validator?.getFeedback(_value.data, getCountry))
    feedback =  feedback?.setData(validator?.getFeedback(_value.data, getCountry));
    _placeholder = placeholder ?? validator?.getPlaceholder() ?? type
  }
  
  onDestroy(_value.addCallbackAndRun(v => {
    if (validator.isValid(v, getCountry)) {
      feedback?.setData(undefined);
      value.setData(v);
      return;
    }
    value.setData(undefined);
    feedback?.setData(validator.getFeedback(v, getCountry));
  }))

  if (validator === undefined) {
    throw "Not a valid type for a validator:" + type;
  }

  const isValid = _value.map(v => validator.isValid(v, getCountry));

  let htmlElem: HTMLInputElement;

  let dispatch = createEventDispatcher<{ selected }>();
  $: {
    if (htmlElem !== undefined) {
      htmlElem.onfocus = () => dispatch("selected");
    }
  }
</script>

{#if validator.textArea}
  <textarea class="w-full" bind:value={$_value} inputmode={validator.inputmode ?? "text"} placeholder={_placeholder}></textarea>
{:else }
  <span class="inline-flex">
    <input bind:this={htmlElem} bind:value={$_value} inputmode={validator.inputmode ?? "text"} placeholder={_placeholder}>
    {#if !$isValid}
      <ExclamationIcon class="h-6 w-6 -ml-6"></ExclamationIcon>
    {/if}
  </span>
{/if}
