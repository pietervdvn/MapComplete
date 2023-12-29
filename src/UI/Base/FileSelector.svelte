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

<form
  on:change|preventDefault={() => {
    drawAttention = false
    dispatcher("submit", inputElement.files)
  }}
  on:dragend={() => {
    console.log("Drag end")
    drawAttention = false
  }}
  on:dragenter|preventDefault|stopPropagation={(e) => {
    console.log("Dragging enter")
    drawAttention = true
    e.dataTransfer.drop = "copy"
  }}
  on:dragstart={() => {
    console.log("DragStart")
    drawAttention = false
  }}
  on:drop|preventDefault|stopPropagation={(e) => {
    console.log("Got a 'drop'")
    drawAttention = false
    dispatcher("submit", e.dataTransfer.files)
  }}
>
  <label
    class={twMerge(cls, drawAttention ? "glowing-shadow" : "")}
    style="margin-left:0"
    tabindex="0"
    for={"fileinput" + id}
    on:click={() => {
      console.log("Clicked", inputElement)
      inputElement.click()
    }}
  >
    <slot />
  </label>
  <input
    {accept}
    bind:this={inputElement}
    class="hidden"
    id={"fileinput" + id}
    {multiple}
    name="file-input"
    type="file"
  />
</form>
