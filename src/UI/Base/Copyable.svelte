<script lang="ts">
  
import { Utils } from "../../Utils"
import Share from "@babeard/svelte-heroicons/solid/Share"
import { DocumentDuplicateIcon } from "@rgossiaux/svelte-heroicons/outline"
import Tr from "./Tr.svelte"
import Translations from "../i18n/Translations"
import ThemeViewState from "../../Models/ThemeViewState"
const tr = Translations.t.general.sharescreen

export let text: string
export let state: ThemeViewState = undefined
async function shareCurrentLink() {
  await navigator.share({
    title: Translations.W(state.layout.title)?.ConstructElement().textContent ?? "MapComplete",
    text: Translations.W(state.layout.description)?.ConstructElement().textContent ?? "",
    url: text,
  })
}

let isCopied = false

async function copyCurrentLink() {
  await navigator.clipboard.writeText(text)
  isCopied = true
  await Utils.waitFor(5000)
  isCopied = false
}
</script>

<div class="flex flex-col">

<div class="flex">
  <div class="literal-code" on:click={(e) => Utils.selectTextIn(e.target)}>
    {text}
  </div>
  <div class="flex flex-col">
    {#if typeof navigator?.share === "function" && state !== undefined}
      <button class="h-8 w-8 shrink-0 p-1" on:click={shareCurrentLink}>
        <Share />
      </button>
    {/if}
    {#if navigator.clipboard !== undefined}
      <button class="no-image-background h-8 w-8 shrink-0 p-1" on:click={copyCurrentLink}>
        <DocumentDuplicateIcon />
      </button>
    {/if}
  </div>


</div>


<div class="flex justify-center">
  {#if isCopied}
    <Tr t={tr.copiedToClipboard} cls="thanks m-2" />
  {/if}
</div>
</div>
