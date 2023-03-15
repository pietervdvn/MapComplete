<script lang="ts">
  import BaseUIElement from "../BaseUIElement.js"
  import { onMount } from "svelte"

  export let construct: BaseUIElement | (() => BaseUIElement)
  let elem: HTMLElement

  onMount(() => {
    let html =
      typeof construct === "function"
        ? construct().ConstructElement()
        : construct.ConstructElement()

    elem.replaceWith(html)
  })
</script>

<span bind:this={elem} />
