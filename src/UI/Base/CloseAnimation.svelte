<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import { onDestroy, onMount } from "svelte"

  let elem: HTMLElement
  let targetOuter: HTMLElement
  export let isOpened: Store<boolean>
  export let moveTo: Store<HTMLElement>

  export let debug : string
  function copySizeOf(htmlElem: HTMLElement) {
    const target = htmlElem.getBoundingClientRect()
    elem.style.left = target.x + "px"
    elem.style.top = target.y + "px"
    elem.style.width = target.width + "px"
    elem.style.height = target.height + "px"
  }

  function animate(opened: boolean) {
    const moveToElem = moveTo.data
console.log("Animating", debug," to", opened)
    if (opened) {
      copySizeOf(targetOuter)
      elem.style.background = "var(--background-color)"
    } else if (moveToElem !== undefined) {
      copySizeOf(moveToElem)
      elem.style.background = "#ffffff00"
    } else {
      elem.style.left = "0px"
      elem.style.top = "0px"
      elem.style.background = "#ffffff00"
    }
  }

  onDestroy(isOpened.addCallback(opened => animate(opened)))
  onMount(() =>  requestAnimationFrame(() => animate(isOpened.data)))


</script>
<div class={"absolute bottom-0 right-0 h-full w-screen p-4 md:p-6 pointer-events-none invisible"}>
  <div class="content h-full" bind:this={targetOuter} style="background: red" />
</div>

<div bind:this={elem} class="pointer-events-none absolute bottom-0 right-0 low-interaction rounded-2xl"
     style="transition: all 0.5s ease-out, background-color 1.4s ease-out; background: var(--background-color);">
  <!-- Classes should be the same as the 'floatoaver' -->
</div>


