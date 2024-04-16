<script lang="ts">
  /**
   * A screen showing:
   * - A link to share the current view
   * - Some query parameters that can be enabled/disabled
   * - The code to embed MC as IFrame
   */

  import ThemeViewState from "../../Models/ThemeViewState"
  import { QueryParameters } from "../../Logic/Web/QueryParameters"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { Utils } from "../../Utils"
  import { DocumentDuplicateIcon } from "@rgossiaux/svelte-heroicons/outline"
  import Share from "../../assets/svg/Share.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Img from "../Base/Img"
  import Qr from "../../Utils/Qr"

  export let state: ThemeViewState
  const tr = Translations.t.general.sharescreen

  let url = window.location
  let linkToShare: string = undefined
  /**
   * In some cases (local deploys, custom themes), we need to set the URL to `/theme.html?layout=xyz` instead of `/xyz?...`
   */
  let needsThemeRedirect = url.port !== "" || url.hostname.match(/^[0-9]/) || !state.layout.official
  let layoutId = state.layout.id
  let baseLink =
    url.protocol +
    "//" +
    url.host +
    "/" +
    (needsThemeRedirect ? "theme.html?layout=" + layoutId + "&" : layoutId + "?")

  let showWelcomeMessage = true
  let enableLogin = true
  $: {
    const layout = state.layout
    let excluded = Utils.NoNull([
      showWelcomeMessage ? undefined : "fs-welcome-message",
      enableLogin ? undefined : "fs-enable-login",
    ])
    linkToShare =
      baseLink +
      QueryParameters.GetParts(new Set(excluded))
        .concat(excluded.map((k) => k + "=" + false))
        .join("&")
    if (layout.definitionRaw !== undefined) {
      linkToShare += "&userlayout=" + (layout.definedAtUrl ?? layout.id)
    }
  }

  async function shareCurrentLink() {
    await navigator.share({
      title: Translations.W(state.layout.title)?.ConstructElement().textContent ?? "MapComplete",
      text: Translations.W(state.layout.description)?.ConstructElement().textContent ?? "",
      url: linkToShare,
    })
  }

  let isCopied = false

  async function copyCurrentLink() {
    await navigator.clipboard.writeText(linkToShare)
    isCopied = true
    await Utils.waitFor(5000)
    isCopied = false
  }
</script>

<div class="flex flex-col">
  <div class="flex items-start justify-between">
    <div class="flex flex-col">
      <Tr t={tr.intro} />
      <div class="flex">
        {#if typeof navigator?.share === "function"}
          <button class="h-8 w-8 shrink-0 p-1" on:click={shareCurrentLink}>
            <Share />
          </button>
        {/if}
        {#if navigator.clipboard !== undefined}
          <button class="no-image-background h-8 w-8 shrink-0 p-1" on:click={copyCurrentLink}>
            <DocumentDuplicateIcon />
          </button>
        {/if}
        <div class="literal-code" on:click={(e) => Utils.selectTextIn(e.target)}>
          {linkToShare}
        </div>
      </div>
    </div>

    <ToSvelte
      construct={() => new Img(new Qr(linkToShare).toImageElement(125)).SetStyle("width: 125px")}
    />
  </div>

  <div class="flex justify-center">
    {#if isCopied}
      <Tr t={tr.copiedToClipboard} cls="thanks m-2" />
    {/if}
  </div>

  <Tr t={tr.embedIntro} />

  <div class="interactive flex flex-col p-1">
    <div class="literal-code m-1">
      &lt;span class="literal-code iframe-code-block"&gt; <br />
      &lt;iframe src="{linkToShare}"
      <br />
      allow="geolocation" width="100%" height="100%" style="min-width: 250px; min-height: 250px"
      <br />
      title="{state.layout.title?.txt ?? "MapComplete"} with MapComplete"&gt;
      <br />
      &lt;/iframe&gt;
      <br />
      &lt;/span&gt;
    </div>
    <div class="link-underline my-1 flex flex-col">
      <label>
        <input bind:checked={showWelcomeMessage} type="checkbox" id="share_show_welcome" />
        <Tr t={tr.fsWelcomeMessage} />
      </label>

      <label>
        <input bind:checked={enableLogin} type="checkbox" id="share_enable_login" />
        <Tr t={tr.fsUserbadge} />
      </label>
    </div>
  </div>
  <Tr cls="link-underline" t={tr.documentation} />
</div>
