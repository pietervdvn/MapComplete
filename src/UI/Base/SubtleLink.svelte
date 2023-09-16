<script lang="ts">
  import { onMount } from "svelte"
  import { twJoin, twMerge } from "tailwind-merge"
  import BaseUIElement from "../BaseUIElement"
  import Img from "./Img"

  export let imageUrl: string | BaseUIElement = undefined
  export let href: string
  export let newTab = false
  export let options: {
    imgSize?: string
    extraClasses?: string
  } = {}

  let imgElem: HTMLElement
  let imgClasses = twJoin("block justify-center shrink-0 mr-4", options?.imgSize ?? "h-11 w-11")

  onMount(() => {
    // Image
    if (imgElem && imageUrl) {
      let img: BaseUIElement

      if ((imageUrl ?? "") === "") {
        img = undefined
      } else if (typeof imageUrl !== "string") {
        img = imageUrl?.SetClass(imgClasses)
      }
      if (img) imgElem.replaceWith(img.ConstructElement())
    }
  })
</script>

<a
  class={twMerge(options.extraClasses, "button text-ellipsis")}
  {href}
  target={newTab ? "_blank" : undefined}
  rel={newTab ? "noopener" : undefined}
>
  <slot name="image">
    {#if imageUrl !== undefined}
      {#if typeof imageUrl === "string"}
        <Img src={imageUrl} class={imgClasses} />
      {:else}
        <template bind:this={imgElem} />
      {/if}
    {/if}
  </slot>

  <slot />
</a>
