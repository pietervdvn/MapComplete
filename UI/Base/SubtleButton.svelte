<script lang="ts">
  import { onMount } from "svelte";
  import { Store } from "../../Logic/UIEventSource";
  import BaseUIElement from "../BaseUIElement";
  import Img from "./Img";
  import Translations from "../i18n/Translations";
  import { ImmutableStore } from "../../Logic/UIEventSource.js";

  export let imageUrl: string | BaseUIElement = undefined;
  export let message: string | BaseUIElement = undefined;
  export let options: {
    url?: string | Store<string>
    newTab?: boolean
    imgSize?: string
    extraClasses?: string
  } = {};

  // Website to open when clicked
  let href : Store<string> = undefined
  if(options?.url){
     href = typeof options?.url == "string" ? new ImmutableStore(options.url) : options.url;
  }

  let imgElem: HTMLElement;
  let msgElem: HTMLElement;
  let imgClasses = "block justify-center shrink-0 mr-4 " + (options?.imgSize ?? "h-11 w-11");

  onMount(() => {
    // Image
    if (imgElem && imageUrl) {
      let img: BaseUIElement;

      if ((imageUrl ?? "") === "") {
        img = undefined;
      } else if (typeof imageUrl !== "string") {
        img = imageUrl?.SetClass(imgClasses);
      }
      if (img) imgElem.replaceWith(img.ConstructElement());
    }

    // Message
    if (msgElem && message) {
      let msg = Translations.W(message)?.SetClass("block text-ellipsis no-images flex-shrink");
      msgElem.replaceWith(msg.ConstructElement());
    }
  });
</script>

<svelte:element
  class={(options.extraClasses??"") + 'flex hover:shadow-xl transition-[color,background-color,box-shadow] hover:bg-unsubtle'}
  href={$href}
  target={options?.newTab ? "_blank" : ""}
  this={href === undefined ? "span" : "a"}
>
  <slot name="image">
    {#if imageUrl !== undefined}
      {#if typeof imageUrl === "string"}
        <Img src={imageUrl} class={imgClasses+ " bg-red border border-black"}></Img>
      {:else }
        <template bind:this={imgElem} />
      {/if}
    {/if}
  </slot>

  <slot name="message">
    <template bind:this={msgElem} />
  </slot>
</svelte:element>

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
