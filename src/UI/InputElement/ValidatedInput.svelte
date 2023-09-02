<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { ValidatorType } from "./Validators"
  import Validators from "./Validators"
  import { ExclamationIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { Translation } from "../i18n/Translation"
  import { createEventDispatcher, onDestroy } from "svelte"
  import { Validator } from "./Validator"
  import { Unit } from "../../Models/Unit"
  import UnitInput from "../Popup/UnitInput.svelte"

  export let type: ValidatorType
  export let feedback: UIEventSource<Translation> | undefined = undefined
  export let getCountry: () => string | undefined
  export let placeholder: string | Translation | undefined
  export let unit: Unit = undefined

  export let value: UIEventSource<string>
  /**
   * Internal state bound to the input element.
   *
   * This is only copied to 'value' when appropriate so that no invalid values leak outside;
   * Additionally, the unit is added when copying
   */
  let _value = new UIEventSource(value.data ?? "")

  let validator: Validator = Validators.get(type ?? "string")
  let selectedUnit: UIEventSource<string> = new UIEventSource<string>(undefined)
  let _placeholder = placeholder ?? validator?.getPlaceholder() ?? type

  function initValueAndDenom() {
    if (unit && value.data) {
      const [v, denom] = unit?.findDenomination(value.data, getCountry)
      if (denom) {
        _value.setData(v)
        selectedUnit.setData(denom.canonical)
      } else {
        _value.setData(value.data ?? "")
      }
    } else {
      _value.setData(value.data ?? "")
    }
  }

  initValueAndDenom()

  $: {
    // The type changed -> reset some values
    validator = Validators.get(type ?? "string")
    _placeholder = placeholder ?? validator?.getPlaceholder() ?? type
    feedback = feedback?.setData(validator?.getFeedback(_value.data, getCountry))

    initValueAndDenom()
  }

  function setValues() {
    // Update the value stores
    const v = _value.data
    if (!validator.isValid(v, getCountry) || v === "") {
      value.setData(undefined)
      feedback?.setData(validator.getFeedback(v, getCountry))
      return
    }

    if (unit && isNaN(Number(v))) {
      console.debug("Not a number, but a unit is required")
      value.setData(undefined)
      return
    }

    feedback?.setData(undefined)
    value.setData(v + (selectedUnit.data ?? ""))
  }

  onDestroy(_value.addCallbackAndRun((_) => setValues()))
  onDestroy(selectedUnit.addCallback((_) => setValues()))
  if (validator === undefined) {
    throw "Not a valid type for a validator:" + type
  }

  const isValid = _value.map((v) => validator.isValid(v, getCountry))

  let htmlElem: HTMLInputElement

  let dispatch = createEventDispatcher<{ selected }>()
  $: {
    if (htmlElem !== undefined) {
      htmlElem.onfocus = () => dispatch("selected")
    }
  }
</script>

{#if validator.textArea}
  <textarea
    class="w-full"
    bind:value={$_value}
    inputmode={validator.inputmode ?? "text"}
    placeholder={_placeholder}
  />
{:else}
  <span class="inline-flex">
    <input
      bind:this={htmlElem}
      bind:value={$_value}
      class="w-full"
      inputmode={validator.inputmode ?? "text"}
      placeholder={_placeholder}
    />
    {#if !$isValid}
      <ExclamationIcon class="-ml-6 h-6 w-6" />
    {/if}

    {#if unit !== undefined}
      <UnitInput {unit} {selectedUnit} textValue={_value} upstreamValue={value} />
    {/if}
  </span>
{/if}
