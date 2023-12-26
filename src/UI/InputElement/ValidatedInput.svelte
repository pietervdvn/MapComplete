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
  import { Utils } from "../../Utils"
  import { twMerge } from "tailwind-merge"

  export let type: ValidatorType
  export let feedback: UIEventSource<Translation> | undefined = undefined
  export let cls: string = undefined
  export let getCountry: () => string | undefined = undefined
  export let placeholder: string | Translation | undefined = undefined
  export let autofocus: boolean = false
  export let unit: Unit = undefined
  /**
   * Valid state, exported to the calling component
   */
  export let value: UIEventSource<string | undefined>
  /**
   * Internal state bound to the input element.
   *
   * This is only copied to 'value' when appropriate so that no invalid values leak outside;
   * Additionally, the unit is added when copying
   */
  let _value = new UIEventSource(value.data ?? "")

  let validator: Validator = Validators.get(type ?? "string")
  if (validator === undefined) {
    console.warn("Didn't find a validator for type", type)
  }
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
    if (_value.data?.length > 0) {
      feedback?.setData(validator?.getFeedback(_value.data, getCountry))
    } else {
      feedback?.setData(undefined)
    }

    initValueAndDenom()
  }

  function setValues() {
    // Update the value stores
    const v = _value.data
    if (v === "") {
      value.setData(undefined)
      feedback?.setData(undefined)
      return
    }
    if (!validator?.isValid(v, getCountry)) {
      feedback?.setData(validator?.getFeedback(v, getCountry))
      value.setData(undefined)
      return
    }

    if (unit !== undefined && isNaN(Number(v))) {
      value.setData(undefined)
      return
    }

    feedback?.setData(undefined)
    if (selectedUnit.data) {
      value.setData(unit.toOsm(v, selectedUnit.data))
    } else {
      value.setData(v)
    }
  }

  onDestroy(_value.addCallbackAndRun((_) => setValues()))
  if (unit === undefined) {
    onDestroy(
      value.addCallbackAndRunD((fromUpstream) => {
        if (_value.data !== fromUpstream && fromUpstream !== "") {
          _value.setData(fromUpstream)
        }
      }),
    )
  } else {
    // Handled by the UnitInput
  }
  onDestroy(selectedUnit.addCallback((_) => setValues()))
  if (validator === undefined) {
    throw (
      "Not a valid type (no validator found) for type '" +
      type +
      "'; did you perhaps mean one of: " +
      Utils.sortedByLevenshteinDistance(
        type,
        Validators.AllValidators.map((v) => v.name),
        (v) => v,
      )
        .slice(0, 5)
        .join(", ")
    )
  }

  const isValid = _value.map((v) => validator?.isValid(v, getCountry) ?? true)

  let htmlElem: HTMLInputElement | HTMLTextAreaElement

  let dispatch = createEventDispatcher<{ selected }>()
  $: {
    if (htmlElem !== undefined) {
      htmlElem.onfocus = () => dispatch("selected")
      if (autofocus) {
        Utils.focusOn(htmlElem)
      }
    }
  }

</script>

{#if validator?.textArea}
    <textarea
      class="w-full"
      bind:value={$_value}
      inputmode={validator?.inputmode ?? "text"}
      placeholder={_placeholder}
      bind:this={htmlElem}
    />
{:else}
  <div class={twMerge("inline-flex", cls)}>
    <input
      bind:this={htmlElem}
      bind:value={$_value}
      class="w-full"
      inputmode={validator?.inputmode ?? "text"}
      placeholder={_placeholder}
    />
    {#if !$isValid}
      <ExclamationIcon class="-ml-6 h-6 w-6" />
    {/if}

    {#if unit !== undefined}
      <UnitInput {unit} {selectedUnit} textValue={_value} upstreamValue={value} {getCountry} />
    {/if}
  </div>
{/if}
