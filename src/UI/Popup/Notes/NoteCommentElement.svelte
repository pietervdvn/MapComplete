<script lang="ts">
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import Translations from "../../i18n/Translations"
  import Note from "../../../assets/svg/Note.svelte"
  import Resolved from "../../../assets/svg/Resolved.svelte"
  import Speech_bubble from "../../../assets/svg/Speech_bubble.svelte"
  import { ImmutableStore, Stores } from "../../../Logic/UIEventSource"
  import { Utils } from "../../../Utils"
  import Img from "../../Base/Img"
  import { SlideShow } from "../../Image/SlideShow"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import Tr from "../../Base/Tr.svelte"

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


  let imgStore = new ImmutableStore(
    images.map((i) =>
      new Img(i).SetClass("w-full block cursor-pointer")
        .onClick(() =>
          state?.previewedImage?.setData(
            <any>{
              url_hd: i,
              url: i,
            }),
        )))


</script>

<div class="flex flex-col py-2 my-2 border-gray-500 border-b" class:border-interactive={comment.highlighted}>

  <div class="flex">

    <!-- Action icon, e.g. 'created', 'commented', 'closed' -->
    {#if comment.action === "opened" || comment.action === "reopened"}
      <Note class="shrink-0 mr-4 w-6" />
    {:else if comment.action === "closed"}
      <Resolved class="shrink-0 mr-4 w-6" />
    {:else}
      <Speech_bubble class="shrink-0 mr-4 w-6" />
    {/if}
    <div class="flex flex-col gap-y-2">
      {@html comment.html}
    </div>
  </div>

  {#if images.length > 0}
    <ToSvelte
      construct={() => new SlideShow(imgStore) .SetClass("mb-1").SetStyle("min-width: 50px; background: grey;")} />
  {/if}


  <div class="flex justify-end items-center subtle pt-4 pb-2">
    <!-- commenter info -->

    {#if $userinfo?.user?.img?.href}
      <img alt="avatar" aria-hidden="true" src={$userinfo?.user?.img?.href} class="rounded-full w-8 h-8 mr-4" />
    {/if}

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
