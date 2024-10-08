<script lang="ts">
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import Translations from "../../i18n/Translations"
  import Note from "../../../assets/svg/Note.svelte"
  import Resolved from "../../../assets/svg/Resolved.svelte"
  import Speech_bubble from "../../../assets/svg/Speech_bubble.svelte"
  import { Stores } from "../../../Logic/UIEventSource"
  import { Utils } from "../../../Utils"
  import Tr from "../../Base/Tr.svelte"
  import AllImageProviders from "../../../Logic/ImageProviders/AllImageProviders"
  import AttributedImage from "../../Image/AttributedImage.svelte"

  export let comment: {
    date: string
    uid: number
    user: string
    user_url: string
    action: "closed" | "opened" | "reopened" | "commented"
    text: string
    html: string
    highlighted: boolean
  }
  export let state: SpecialVisualizationState = undefined

  const t = Translations.t.notes

  // Info about the user who made the comment
  let userinfo = Stores.FromPromise(
    Utils.downloadJsonCached<{ user: { img: { href: string } } }>(
      "https://api.openstreetmap.org/api/0.6/user/" + comment.uid,
      24 * 60 * 60 * 1000,
    ),
  )

  const htmlElement = document.createElement("div")
  htmlElement.innerHTML = Utils.purify(comment.html)
  let images: string[] = Array.from(htmlElement.getElementsByTagName("a"))
    .map((link) => link.href)
    .filter((link) => {
      link = link.toLowerCase()
      const lastDotIndex = link.lastIndexOf(".")
      const extension = link.substring(lastDotIndex + 1, link.length)
      return Utils.imageExtensions.has(extension)
    })
    .filter((link) => !link.startsWith("https://wiki.openstreetmap.org/wiki/File:"))


  const attributedImages = AllImageProviders.loadImagesFrom(images)
  /**
   * Class of the little icons indicating 'opened', 'comment' and 'resolved'
   */
  export let iconClass = "shrink-0 w-6 mr-3 my-2 "

</script>

<div class="flex flex-col my-2 border-gray-500 border-b" class:border-interactive={comment.highlighted}>

  <div class="flex items-center">

    <!-- Action icon, e.g. 'created', 'commented', 'closed' -->

    {#if $userinfo?.user?.img?.href}
      <img alt="avatar" aria-hidden="true" src={$userinfo?.user?.img?.href} class="rounded-full w-10 h-10 mr-3" />
    {:else if comment.action === "opened" || comment.action === "reopened"}
      <Note class={iconClass} />
    {:else if comment.action === "closed"}
      <Resolved class={iconClass} />
    {:else}
      <Speech_bubble class={iconClass} />
    {/if}
    <div class="flex flex-col gap-y-2">
      {@html comment.html}
    </div>
  </div>

  {#if $attributedImages?.length > 0}
    <div class="flex justify-center w-full space-x-4 overflow-x-auto" style="scroll-snap-type: x proximity">
      {#each $attributedImages as image (image.id)}
        <AttributedImage
          {state}
          {image}
          imgClass="max-h-64 w-auto sm:h-32 md:h-64"
          previewedImage={state.previewedImage}
          attributionFormat="minimal"
        >
        </AttributedImage>
        {/each}
    </div>
  {/if}


  <div class="flex justify-end items-center subtle py-2">
    <!-- commenter info -->
    <span class="mr-2">
      {#if comment.user === undefined}
        <Tr t={t.anonymous} />
      {:else}
        <a href={comment.user_url} target="_blank">{comment.user}</a>
      {/if}
      {comment.date}
    </span>

  </div>
</div>
