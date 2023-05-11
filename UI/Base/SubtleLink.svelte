<script lang="ts">
  import {createEventDispatcher, onMount} from "svelte";
  import BaseUIElement from "../BaseUIElement";
  import Img from "./Img";

  export let imageUrl: string | BaseUIElement = undefined
  export let href: string
  export let newTab = false
  export let options: {
    imgSize?: string
    // extraClasses?: string
  } = {}
  

  let imgElem: HTMLElement;
  let imgClasses = "block justify-center shrink-0 mr-4 " + (options?.imgSize ?? "h-11 w-11");

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
  class={(options.extraClasses??"") + 'flex hover:shadow-xl transition-[color,background-color,box-shadow] hover:bg-unsubtle cursor-pointer'}
  {href}
  target={newTab ? "_blank" : ""}}
>
  <slot name="image">
    {#if imageUrl !== undefined}
      {#if typeof imageUrl === "string"}
        <Img src={imageUrl} class={imgClasses}></Img>
      {:else }
        <template bind:this={imgElem} />
      {/if}
    {/if}
  </slot>

  <slot/>
</a>

<style lang="scss">
  span,
  a {
    @apply flex p-3 my-2 py-4 rounded-lg shrink-0;
    @apply items-center w-full no-underline;
    @apply bg-subtle text-black;

    :global(span) {
      @apply block text-ellipsis;
    }
  }
</style>
