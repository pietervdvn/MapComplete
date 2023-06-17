<script lang="ts">
    import EditLayerState from "./EditLayerState";
    import type {ConfigMeta} from "./configMeta";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import SchemaBasedInput from "./SchemaBasedInput.svelte";

    export let state: EditLayerState
    export let schema: ConfigMeta
    export let path: (string | number)[] = []

    const subparts = state.getSchemaStartingWith(schema.path)
    console.log("Got array:", {schema, subparts})

    let createdItems = 0
    /**
     * Keeps track of the items.
     * We keep a single string (stringified 'createdItems') to make sure the order is corrects
     */
    export let values: UIEventSource<string[]> = new UIEventSource<string[]>([])

    function createItem() {
        values.data.push("" + createdItems)
        createdItems++
        values.ping()
    }

</script>


<div class="pl-2">
    <h3>{schema.path.at(-1)}</h3>

    <span class="subtle">
        {schema.description}
    </span>

    {#if $values.length === 0}
        No values are defined
    {:else}
        {#each $values as value (value)}
            <div class="border border-black">
                {#each subparts as subpart}
                    <SchemaBasedInput {state} path = {[...path, value, ...subpart.path]} schema={subpart}/>
                {/each}
            </div>
        {/each}
    {/if}
    <button on:click={createItem}>Add an entry</button>
</div>
