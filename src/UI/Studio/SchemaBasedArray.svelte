<script lang="ts">
  import EditLayerState from "./EditLayerState";
  import type { ConfigMeta } from "./configMeta";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import SchemaBasedInput from "./SchemaBasedInput.svelte";
  import SchemaBasedField from "./SchemaBasedField.svelte";
  import { TrashIcon } from "@babeard/svelte-heroicons/mini";
  import TagRenderingInput from "./TagRenderingInput.svelte";

  export let state: EditLayerState;
  export let schema: ConfigMeta;

 
  let title = schema.path.at(-1);
  let singular = title;
  if (title?.endsWith("s")) {
    singular = title.slice(0, title.length - 1);
  }
  let article = "a";
  if (singular?.match(/^[aeoui]/)) {
    article = "an";
  }
  export let path: (string | number)[] = [];
  const isTagRenderingBlock = path.length === 1 && path[0] === "tagRenderings";

  const subparts = state.getSchemaStartingWith(schema.path);

  /**
   * Store the _indices_
   */
  export let values: UIEventSource<number[]> = new UIEventSource<number[]>([]);

  const currentValue = <[]>state.getCurrentValueFor(path);
  if (currentValue) {
    if (!Array.isArray(currentValue)) {
      console.error("SchemaBaseArray for path", path, "expected an array as initial value, but got a", typeof currentValue, currentValue);
    } else {
      values.setData(currentValue.map((_, i) => i));
    }
  }
  let createdItems = values.data.length;


  function createItem(valueToSet?: any) {
    values.data.push(createdItems);
    if (valueToSet) {
      state.setValueAt([...path, createdItems], valueToSet);
    }
    createdItems++;
    values.ping();
  }

  function fusePath(i: number, subpartPath: string[]): (string | number)[] {
    const newPath = [...path, i];
    const toAdd = [...subpartPath];
    for (const part of path) {
      if (toAdd[0] === part) {
        toAdd.splice(0, 1);
      }
    }
    newPath.push(...toAdd);
    return newPath;
  }

  function del(value) {
    values.data.splice(values.data.indexOf(value));
    values.ping();
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
      <div class="flex w-full">
        <SchemaBasedField {state} {schema} path={[...path, value]} />
        <button class="border-black border rounded-full p-1 w-fit h-fit"
                on:click={() => {del(value)}}>
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    {/each}
  {:else}
    {#each $values as value (value)}

      {#if !isTagRenderingBlock}
        <div class="flex justify-between items-center">
          <h3 class="m-0">{singular} {value}</h3>
          <button class="border-black border rounded-full p-1 w-fit h-fit"
                  on:click={() => {del(value)}}>
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      {/if}
      <div class="border border-black">
        {#if isTagRenderingBlock}
          <TagRenderingInput path={path.concat(value)} {state} {schema} >
            <button slot="upper-right" class="border-black border rounded-full p-1 w-fit h-fit"
                    on:click={() => {del(value)}}>
              <TrashIcon class="w-4 h-4" />
            </button>
          </TagRenderingInput>
        {:else}
          {#each subparts as subpart}
            <SchemaBasedInput {state} path={fusePath(value, subpart.path)} schema={subpart} />
          {/each}
        {/if}
      </div>
    {/each}
  {/if}
  <div class="flex">
    <button on:click={() => createItem()}>Add {article} {singular}</button>
    {#if path.length === 1 && path[0] === "tagRenderings"}
      <button on:click={() => {createItem();}}>Add a builtin tagRendering</button>
    {/if}
    <slot name="extra-button" />
  </div>
</div>
