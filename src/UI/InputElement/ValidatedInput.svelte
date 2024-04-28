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
  export let unvalidatedText = new UIEventSource(value.data ?? "")

  if (unvalidatedText == /*Compare by reference!*/ value) {
    throw "Value and unvalidatedText may not be the same store!"
  }
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
        unvalidatedText.setData(v)
        selectedUnit.setData(denom.canonical)
      } else {
        unvalidatedText.setData(value.data ?? "")
      }
    } else {
      unvalidatedText.setData(value.data ?? "")
    }
  }

  function onKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.stopPropagation()
      e.preventDefault()
      dispatch("submit")
    }
  }
  initValueAndDenom()

  $: {
    // The type changed -> reset some values
    validator = Validators.get(type ?? "string")

    _placeholder = placeholder ?? validator?.getPlaceholder() ?? type
    if (unvalidatedText.data?.length > 0) {
      feedback?.setData(validator?.getFeedback(unvalidatedText.data, getCountry))
    } else {
      feedback?.setData(undefined)
    }

    initValueAndDenom()
  }

  function setValues() {
    // Update the value stores
    const v = unvalidatedText.data
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

    feedback?.setData(undefined)
    if (selectedUnit.data) {
      value.setData(unit.toOsm(v, selectedUnit.data))
    } else {
      value.setData(v)
    }
  }

  onDestroy(unvalidatedText.addCallbackAndRun((_) => setValues()))
  if (unit === undefined) {
    onDestroy(
      value.addCallbackAndRunD((fromUpstream) => {
        if (unvalidatedText.data !== fromUpstream && fromUpstream !== "") {
          unvalidatedText.setData(fromUpstream)
        }
      })
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
        (v) => v
      )
        .slice(0, 5)
        .join(", ")
    )
  }

  const isValid = unvalidatedText.map((v) => validator?.isValid(v, getCountry) ?? true)

  let htmlElem: HTMLInputElement | HTMLTextAreaElement

  let dispatch = createEventDispatcher<{ selected; submit }>()
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
    bind:value={$unvalidatedText}
    inputmode={validator?.inputmode ?? "text"}
    placeholder={_placeholder}
    bind:this={htmlElem}
    on:keypress={onKeyPress}
  />
{:else}
  <div class={twMerge("inline-flex", cls)}>
    <input
      bind:this={htmlElem}
      bind:value={$unvalidatedText}
      class="w-full"
      inputmode={validator?.inputmode ?? "text"}
      placeholder={_placeholder}
      on:keypress={onKeyPress}
    />
    {#if !$isValid}
      <ExclamationIcon class="-ml-6 h-6 w-6" />
    {/if}

    {#if unit !== undefined}
      <UnitInput
        {unit}
        {selectedUnit}
        textValue={unvalidatedText}
        upstreamValue={value}
        {getCountry}
      />
    {/if}
  </div>
{/if}
