<script lang="ts">
  import { Unit } from "../../Models/Unit"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import { onDestroy, onMount } from "svelte"
  import { Denomination } from "../../Models/Denomination"

  export let unit: Unit

  /**
   * The current value of the input field
   * Not necessarily a correct number, should not contain the denomination
   */
  export let textValue: UIEventSource<string>
  /**
   * The actual _valid_ value that is upstreamed, including the denomination
   */
  export let upstreamValue: Store<string>

  let isSingle: Store<boolean> = textValue.map((v) => Number(v) === 1)

  export let selectedUnit: UIEventSource<string> = new UIEventSource<string>(undefined)
  export let getCountry = () => "?"

  onMount(() => {
    console.log("Setting selected unit based on country", getCountry(), upstreamValue.data)
    if (upstreamValue.data === undefined || upstreamValue.data === "") {
      // Init the selected unit
      let denomination: Denomination = unit.getDefaultDenomination(getCountry)
      console.log("Found denom", denomination.canonical)
      selectedUnit.setData(denomination.canonical)
    }
  })

  onDestroy(
    upstreamValue.addCallbackAndRun((v) => {
      if (v === undefined || v === "") {
        return
      }
      let denomination: Denomination = unit.getDefaultDenomination(getCountry)
      const selected = unit.findDenomination(v, getCountry)
      if (selected) {
        denomination = selected[1]
      }
      selectedUnit.setData(denomination.canonical)
    })
  )

  onDestroy(
    textValue.addCallbackAndRunD((v) => {
      // Fallback in case that the user manually types a denomination
      const [value, denomination] = unit.findDenomination(v, getCountry)
      if (value === undefined || denomination === undefined) {
        return
      }
      if (value === v) {
        // The input value actually didn't have a denomination typed out - so lets ignore this one
        // If a denomination is given, it is the default value anyway
        return
      }
      textValue.setData(value)
      selectedUnit.setData(denomination.canonical)
    })
  )
</script>

{#if unit.inverted}
  <div class="bold px-2">/</div>
{/if}

<select bind:value={$selectedUnit}>
  {#each unit.denominations as denom (denom.canonical)}
    <option value={denom.canonical}>
      {#if $isSingle || unit.inverted}
        <Tr t={denom.humanSingular} />
      {:else}
        <Tr t={denom.human.Subs({ quantity: "" })} />
      {/if}
    </option>
  {/each}
</select>
