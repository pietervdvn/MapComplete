<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { twMerge } from "tailwind-merge"

  export let accept: string
  export let multiple: boolean = true

  const dispatcher = createEventDispatcher<{ submit: FileList }>()
  export let cls: string = ""
  let drawAttention = false
  let inputElement: HTMLInputElement
  let id = Math.random() * 1000000000 + ""
</script>

<form>
  <label class={twMerge(cls, drawAttention ? "glowing-shadow" : "")} for={"fileinput" + id}>
    <slot />
  </label>
  <input
    {accept}
    bind:this={inputElement}
    class="hidden"
    id={"fileinput" + id}
    {multiple}
    name="file-input"
    on:change|preventDefault={() => {
      drawAttention = false
      dispatcher("submit", inputElement.files)
    }}
    on:dragend={() => {
      drawAttention = false
    }}
    on:dragover|preventDefault|stopPropagation={(e) => {
      console.log("Dragging over!")
      drawAttention = true
      e.dataTransfer.drop = "copy"
    }}
    on:dragstart={() => {
      drawAttention = false
    }}
    on:drop|preventDefault|stopPropagation={(e) => {
      console.log("Got a 'drop'")
      drawAttention = false
      dispatcher("submit", e.dataTransfer.files)
    }}
    type="file"
  />
</form>
