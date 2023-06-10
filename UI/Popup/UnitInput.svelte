<script lang="ts">

    import {Unit} from "../../Models/Unit";
    import {Store, UIEventSource} from "../../Logic/UIEventSource";
    import Tr from "../Base/Tr.svelte";
    import {onDestroy} from "svelte";

    export let unit: Unit


    /**
     * The current value of the input field
     * Not necessarily a correct number
     */
    export let textValue: UIEventSource<string>
    /**
     * The actual _valid_ value that is upstreamed
     */
    export let upstreamValue: Store<string>

    let isSingle: Store<boolean> = textValue.map(v => Number(v) === 1)

    export let selectedUnit: UIEventSource<string> = new UIEventSource<string>(undefined)
    export let getCountry = () => "be"
    console.log("Unit", unit)
    onDestroy(upstreamValue.addCallbackAndRun(v => {
        if (v === undefined) {
            if (!selectedUnit.data) {
                selectedUnit.setData(unit.getDefaultDenomination(getCountry).canonical)
            }
            return
        }
        const selected = unit.findDenomination(v, getCountry)
        if (selected === undefined) {
            selectedUnit.setData(unit.getDefaultDenomination(getCountry).canonical)
            return
        }
        const [value, denomination] = selected
        selectedUnit.setData(denomination.canonical)
        return
    }))

    onDestroy(textValue.addCallbackAndRunD(v => {
        // Fallback in case that the user manually types a denomination
        const [value, denomination] = unit.findDenomination(v, getCountry)
        if (value === undefined || denomination === undefined) {
            return
        }
        textValue.setData(value)
        selectedUnit.setData(denomination.canonical)

    }))


</script>

<select bind:value={$selectedUnit}>
    {#each unit.denominations as denom (denom.canonical)}
        <option value={denom.canonical}>
            {#if $isSingle}
                <Tr t={denom.humanSingular}/>
            {:else }
                <Tr t={denom.human}/>
            {/if}
        </option>
    {/each}
</select>
