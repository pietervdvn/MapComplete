<script lang="ts">
  import { onMount } from "svelte"
  import { Store } from "../../Logic/UIEventSource"
  import BaseUIElement from "../BaseUIElement"
  import Img from "./Img"
  import Translations from "../i18n/Translations"

  export let imageUrl: string | BaseUIElement
  export let message: string | BaseUIElement
  export let options: { url?: string | Store<string>; newTab?: boolean; imgSize?: string, extraClasses?: string }

  let element: HTMLElement
  let href = typeof options?.url == "string" ? options.url : ""

  onMount(() => {
    if (typeof options?.url != "string" && options?.url != undefined) {
      options.url.addCallbackAndRun((data) => {
        href = data
      })
    }

    let img: BaseUIElement
    const imgClasses = "block justify-center flex-none mr-4 " + (options?.imgSize ?? "h-11 w-11")
    if ((imageUrl ?? "") === "") {
      img = undefined
    } else if (typeof imageUrl === "string") {
      img = new Img(imageUrl)?.SetClass(imgClasses)
    } else {
      img = imageUrl?.SetClass(imgClasses)
    }
    if (img != undefined) element.appendChild(img.ConstructElement())

    let msg = Translations.W(message)?.SetClass("block text-ellipsis no-images flex-shrink")
    element.appendChild(msg.ConstructElement())
  })
</script>

{#if options?.url == undefined}
  <span bind:this={element} class="{options.extraClasses}"/>
{:else}
  <a {href} class="no-underline" bind:this={element} target={options?.newTab ? "_blank" : ""} />
{/if}

<style lang="scss">
  span,
  a {
    @apply flex p-3 my-2 rounded-lg hover:shadow-xl transition-colors transition-shadow;
    @apply items-center w-full;
    @apply bg-subtle text-black hover:bg-unsubtle;
  }
</style>
