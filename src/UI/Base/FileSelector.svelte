<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte"
  import { twMerge } from "tailwind-merge"

  export let accept: string
  export let multiple: boolean = true

  const dispatcher = createEventDispatcher<{ submit: FileList }>()
  export let cls: string = ""
  let drawAttention = false
  let inputElement: HTMLInputElement
  let formElement: HTMLFormElement
  let id = "fileinput_" + Math.round(Math.random() * 1000000000000)

  function handleDragEvent(e: DragEvent) {
    if (e.target["id"] == id) {
      return
    }
    if (
      formElement.contains(e.target) ||
      document.getElementsByClassName("selected-element-view")[0]?.contains(e.target)
    ) {
      e.preventDefault()

      if (e.type === "drop") {
        console.log("Got a 'drop'", e)
        drawAttention = false
        dispatcher("submit", e.dataTransfer.files)
        return
      }

      drawAttention = true
      e.dataTransfer.dropEffect = "copy"

      return
      /*
      drawAttention = false
      dispatcher("submit", e.dataTransfer.files)
      console.log("Committing")*/
    }
    drawAttention = false
    e.preventDefault()
    e.dataTransfer.effectAllowed = "none"
    e.dataTransfer.dropEffect = "none"
  }

  window.addEventListener("dragenter", handleDragEvent)
  window.addEventListener("dragover", handleDragEvent)
  window.addEventListener("drop", handleDragEvent)

  onDestroy(() => {
    window.removeEventListener("dragenter", handleDragEvent)
    window.removeEventListener("dragover", handleDragEvent)
    window.removeEventListener("drop", handleDragEvent)
  })
</script>

<form
  bind:this={formElement}
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
    e.dataTransfer.dropEffect = "copy"
  }}
  on:dragstart={() => {
    drawAttention = false
  }}
  on:drop|preventDefault|stopPropagation={(e) => {
    drawAttention = false
    dispatcher("submit", e.dataTransfer.files)
  }}
>
  <label
    class={twMerge(cls, drawAttention ? "glowing-shadow" : "")}
    for={id}
    on:click|preventDefault={() => {
      inputElement.click()
    }}
    style="margin-left:0"
    tabindex="0"
  >
    <slot />
  </label>
  <input
    {accept}
    bind:this={inputElement}
    class="hidden"
    {id}
    {multiple}
    name="file-input"
    type="file"
  />
</form>
