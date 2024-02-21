<script lang="ts">
  import BaseUIElement from "../BaseUIElement.js"
  import { onDestroy, onMount } from "svelte"

  export let construct: BaseUIElement | (() => BaseUIElement)
  let elem: HTMLElement
  let html: HTMLElement
  onMount(() => {
    const uiElem = typeof construct === "function" ? construct() : construct
    html = uiElem?.ConstructElement()

    if (html !== undefined) {
      elem?.replaceWith(html)
    }
  })

  onDestroy(() => {
    html?.remove()
  })
</script>

<span bind:this={elem} />
