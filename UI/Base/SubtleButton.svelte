<script lang="ts">
  import { onMount } from "svelte"
  import { Store } from "../../Logic/UIEventSource"
  import BaseUIElement from "../BaseUIElement"
  import Img from "./Img"
  import Translations from "../i18n/Translations"

  export let imageUrl: string | BaseUIElement
  export let message: string | BaseUIElement
  export let options: {
    url?: string | Store<string>
    newTab?: boolean
    imgSize?: string
    extraClasses?: string
  }

  let href = typeof options?.url == "string" ? options.url : ""

  let imgElem: HTMLElement
  let msgElem: HTMLElement

  onMount(() => {
    if (typeof options?.url != "string" && options?.url != undefined) {
      options.url.addCallbackAndRun((data) => {
        href = data
      })
    }

    // Image
    if (imgElem != undefined) {
      let img: BaseUIElement

      const imgClasses = "block justify-center flex-none mr-4 " + (options?.imgSize ?? "h-11 w-11")
      if ((imageUrl ?? "") === "") {
        img = undefined
      } else if (typeof imageUrl === "string") {
        img = new Img(imageUrl)?.SetClass(imgClasses)
      } else {
        img = imageUrl?.SetClass(imgClasses)
      }

      if (img) imgElem.replaceWith(img.ConstructElement())
    }

    // Message
    if (msgElem != undefined) {
      let msg = Translations.W(message)?.SetClass("block text-ellipsis no-images flex-shrink")
      msgElem.replaceWith(msg.ConstructElement())
    }
  })
</script>

<svelte:element
  this={options?.url == undefined ? "span" : "a"}
  class={options.extraClasses}
  target={options?.newTab ? "_blank" : ""}
  {href}
>
  <slot name="image">
    <template bind:this={imgElem} />
  </slot>
  <slot name="message">
    <template bind:this={msgElem} />
  </slot>
</svelte:element>

<style lang="scss">
  span,
  a {
    @apply flex p-3 my-2 rounded-lg hover:shadow-xl transition-[color,background-color,box-shadow];
    @apply items-center w-full no-underline;
    @apply bg-subtle text-black hover:bg-unsubtle;

    :global(img) {
      @apply block justify-center flex-none mr-4 h-11 w-11;
    }
  }
</style>
