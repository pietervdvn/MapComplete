<script lang="ts">
  import {createEventDispatcher} from "svelte";
  import BaseUIElement from "../BaseUIElement";
  import Img from "./Img";

  export let imageUrl: string | BaseUIElement = undefined
  export let message: string | BaseUIElement = undefined
  export let options: {
    imgSize?: string
    extraClasses?: string
  } = {}

  let imgClasses = "block justify-center shrink-0 mr-4 " + (options?.imgSize ?? "h-11 w-11");
  const dispatch = createEventDispatcher<{click}>()
</script>

<button
  class={(options.extraClasses??"") + ' secondary no-image-background'}
  target={options?.newTab ? "_blank" : ""}
  on:click={(e) => dispatch("click", e)}
>
  <slot name="image">
    {#if imageUrl !== undefined}
      {#if typeof imageUrl === "string"}
        <Img src={imageUrl} class={imgClasses}></Img>
      {/if}
    {/if}
  </slot>

  <slot name="message"/>
</button>
