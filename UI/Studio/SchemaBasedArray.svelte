<script lang="ts">
    import EditLayerState from "./EditLayerState";
    import type {ConfigMeta} from "./configMeta";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import SchemaBasedInput from "./SchemaBasedInput.svelte";
    import SchemaBasedField from "./SchemaBasedField.svelte";
    import {TrashIcon} from "@babeard/svelte-heroicons/mini";

    export let state: EditLayerState
    export let schema: ConfigMeta

    let title = schema.path.at(-1)
    let singular = title
    if (title.endsWith("s")) {
        singular = title.slice(0, title.length - 1)
    }
    let article = "a"
    if (singular.match(/^[aeoui]/)) {
        article = "an"
    }
    export let path: (string | number)[] = []

    const subparts = state.getSchemaStartingWith(schema.path)

    let createdItems = 0
    /**
     * Keeps track of the items.
     * We keep a single string (stringified 'createdItems') to make sure the order is correct
     */
    export let values: UIEventSource<number[]> = new UIEventSource<number[]>([])

    const currentValue = <[]>state.getCurrentValueFor(path)
    if (currentValue) {
        if (!Array.isArray(currentValue)) {
            console.error("SchemaBaseArray for path", path, "expected an array as initial value, but got a", typeof currentValue, currentValue)
        } else {
            values.setData(currentValue.map((_, i) => i))
        }
    }

    function createItem() {
        values.data.push(createdItems)
        createdItems++
        values.ping()
    }

    function fusePath(i: number, subpartPath: string[]): (string | number)[] {
        const newPath = [...path, i]
        const toAdd = [...subpartPath]
        for (const part of path) {
            if (toAdd[0] === part) {
                toAdd.splice(0, 1)
            }
        }
        newPath.push(...toAdd)
        return newPath
    }

</script>


<div class="pl-2">
    <h3>{schema.path.at(-1)}</h3>

    {#if subparts.length > 0}
        <span class="subtle">
            {schema.description}
        </span>
    {/if}

    {#if $values.length === 0}
        No values are defined
    {:else if subparts.length === 0}
        <!-- We need an array of values, so we use the typehint of the _parent_ element as field -->
        {#each $values as value (value)}
            <SchemaBasedField {state} {schema} path={[...path, value]}/>
        {/each}
    {:else}
        {#each $values as value (value)}
            <div class="flex justify-between items-center">
                <h3 class="m-0">{singular} {value}</h3>
                <button class="border-black border rounded-full p-1 w-fit h-fit" on:click={() => {values.data.splice(values.data.indexOf(value)); values.ping()}}>
                    <TrashIcon class="w-4 h-4"/>
                </button>
            </div>
            <div class="border border-black">
                {#each subparts as subpart}
                    <SchemaBasedInput {state} path={fusePath(value, subpart.path)} schema={subpart}/>
                {/each}
            </div>
        {/each}
    {/if}
    <button on:click={createItem}>Add {article} {singular}</button>
</div>
