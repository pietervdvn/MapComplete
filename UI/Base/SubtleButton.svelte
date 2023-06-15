<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import BaseUIElement from "../BaseUIElement"
  import Img from "./Img"
  import { twJoin, twMerge } from "tailwind-merge"

  export let imageUrl: string | BaseUIElement = undefined
  export let message: string | BaseUIElement = undefined
  export let options: {
    imgSize?: string
    extraClasses?: string
  } = {}

  let imgClasses = twJoin("block justify-center shrink-0 mr-4", options?.imgSize ?? "h-11 w-11")
  const dispatch = createEventDispatcher<{ click }>()
</script>

<button
  target={options?.newTab ? "_blank" : ""}
  class={twMerge(options.extraClasses, "secondary no-image-background")}
  on:click={(e) => dispatch("click", e)}>
  <slot name="image">
    {#if imageUrl !== undefined}
      {#if typeof imageUrl === "string"}
        <Img src={imageUrl} class={imgClasses} />
      {/if}
    {/if}
  </slot>

  <slot name="message" />
</button>
