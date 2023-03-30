<script lang="ts">

  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import type { ValidatorType } from "./Validators";
  import Validators from "./Validators";
  import { ExclamationIcon } from "@rgossiaux/svelte-heroicons/solid";
  import { Translation } from "../i18n/Translation";

  export let value: UIEventSource<string>;
  // Internal state, only copied to 'value' so that no invalid values leak outside
  let _value = new UIEventSource(value.data ?? "")
  export let type: ValidatorType;
  let validator = Validators.get(type);
  export let feedback: UIEventSource<Translation> | undefined = undefined
  _value.addCallbackAndRun(v => {
    if(validator.isValid(v)){
      feedback?.setData(undefined)
      value.setData(v)
      return
    }
    value.setData(undefined)
    feedback?.setData(validator.getFeedback(v));
  })

  if (validator === undefined) {
    throw "Not a valid type for a validator:" + type;
  }

  const isValid = _value.map(v => validator.isValid(v));
  

</script>

{#if validator.textArea}
  <textarea bind:value={$_value} inputmode={validator.inputmode ?? "text"}></textarea>
{:else }
  <div class="flex">
    <input bind:value={$_value} inputmode={validator.inputmode ?? "text"}>
    {#if !$isValid}
      <ExclamationIcon class="h-6 w-6 -ml-6"></ExclamationIcon>
    {/if}
  </div>
{/if}
