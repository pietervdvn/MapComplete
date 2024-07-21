<script lang="ts">
  import BaseUIElement from "../BaseUIElement.js"
  import { onDestroy, onMount } from "svelte"
  import SvelteUIElement from "./SvelteUIElement"

  export let construct: BaseUIElement | (() => BaseUIElement)
  let elem: HTMLElement
  let html: HTMLElement
  let isSvelte = false
  let uiElement: BaseUIElement | SvelteUIElement | undefined
  let svelteElem: SvelteUIElement
  onMount(() => {
    uiElement = typeof construct === "function" ? construct() : construct

    if (uiElement?.["isSvelte"]) {
      isSvelte = true
      svelteElem = <SvelteUIElement>uiElement
      return
    }

    html = uiElement?.ConstructElement()

    if (html !== undefined) {
      elem?.replaceWith(html)
    }
  })

  onDestroy(() => {
    html?.remove()
    uiElement?.Destroy()
  })
</script>

{#if isSvelte}
  <svelte:component
    this={svelteElem?._svelteComponent}
    {...svelteElem._props}
    class={svelteElem.getClass()}
    style={svelteElem.getStyle()}
  />
{:else}
  <span bind:this={elem} />
{/if}
