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
  import Qr from "../../Utils/Qr"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import Constants from "../../Models/Constants"
  import Copyable from "../Base/Copyable.svelte"

  export let state: ThemeViewState
  const tr = Translations.t.general.sharescreen

  let url = window.location
  let linkToShare: string = undefined
  /**
   * In some cases (local deploys, custom themes), we need to set the URL to `/theme.html?layout=xyz` instead of `/xyz?...`
   * Note that the 'layout='-param will be included automatically
   */
  let needsThemeRedirect = url.port !== "" || url.hostname.match(/^[0-9]/) || !state.layout.official
  let layoutId = state.layout.id
  let baseLink = `${url.protocol}//${url.host}/${needsThemeRedirect ? "theme.html" : layoutId}?`

  let showWelcomeMessage = true
  let enableLogin = true
  let enableFilters = true
  let enableBackground = true
  let enableGeolocation = true

  let location = state.mapProperties.location

  function calculateLinkToShare(
    showWelcomeMessage: boolean,
    enableLogin: boolean,
    enableFilters: boolean,
    enableBackground: boolean,
    enableGeolocation: boolean
  ) {
    const layout = state.layout
    let excluded = Utils.NoNull([
      showWelcomeMessage ? undefined : "fs-welcome-message",
      enableLogin ? undefined : "fs-enable-login",
      enableFilters ? undefined : "fs-filter",
      enableBackground ? undefined : "fs-background",
      enableGeolocation ? undefined : "fs-geolocation",
    ])
    const layerParamsWhitelist: string[] = ["fs-layers-enabled=false"]
    const layerParamsBlacklist: string[] = []

    for (const flayer of state.layerState.filteredLayers.values()) {
      const id = flayer.layerDef.id
      if (flayer.layerDef.filterIsSameAs) {
        continue
      }
      if (id.indexOf("note_import") >= 0) {
        continue
      }
      if (Constants.added_by_default.indexOf(<any>id) >= 0) {
        continue
      }
      const enabled = flayer.isDisplayed.data
      if (enabled) {
        layerParamsWhitelist.push("layer-" + id + "=true")
      } else {
        layerParamsBlacklist.push("layer-" + id + "=false")
      }
    }

    const layersBlack = layerParamsBlacklist.join("&")
    const layersWhite = layerParamsWhitelist.join("&")
    const layers =
      layersBlack.length < layersWhite.length ? layerParamsBlacklist : layerParamsWhitelist
    const params = QueryParameters.GetParts(new Set(excluded))
      .filter((part) => !part.startsWith("layer-"))
      .concat(...layers)
      .concat(excluded.map((k) => k + "=" + false))
    linkToShare = baseLink + Utils.Dedup(params).join("&")

    if (layout.definitionRaw !== undefined) {
      linkToShare += "&userlayout=" + (layout.definedAtUrl ?? layout.id)
    }
  }

  $: calculateLinkToShare(
    showWelcomeMessage,
    enableLogin,
    enableFilters,
    enableBackground,
    enableGeolocation
  )

  let iframeCode: string
  $: iframeCode = `<iframe src="${linkToShare}"
    ${
      enableGeolocation ? 'allow="geolocation"' : ""
    } width="100%" height="100%" style="min-width: 250px; min-height: 250px"
    title="${state.layout.title?.txt ?? "MapComplete"} with MapComplete">
    </iframe>`

  Array.from(state.layerState.filteredLayers.values()).forEach((flayer) =>
    flayer.isDisplayed.addCallbackAndRunD((_) => {
      calculateLinkToShare(
        showWelcomeMessage,
        enableLogin,
        enableFilters,
        enableBackground,
        enableGeolocation
      )
    })
  )
</script>

<div class="link-underline flex flex-col">
  <a href="geo:{$location.lat},{$location.lon}">Open the current location in other applications</a>

  <div class="flex flex-col">
    <Tr t={tr.intro} />
    <Copyable {state} text={linkToShare} />
  </div>
  <div class="flex justify-center">
    <img src={new Qr(linkToShare).toImageElement(125)} style="width: 125px" />
  </div>

  <Tr t={tr.embedIntro} />

  <Copyable text={iframeCode} />

  <AccordionSingle>
    <div slot="header">
      <Tr t={tr.options} />
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

      <label>
        <input bind:checked={enableFilters} type="checkbox" id="share_enable_filter" />
        <Tr t={tr.fsFilter} />
      </label>

      <label>
        <input bind:checked={enableBackground} type="checkbox" id="share_enable_background" />
        <Tr t={tr.fsBackground} />
      </label>

      <label>
        <input bind:checked={enableGeolocation} type="checkbox" id="share_enable_geolocation" />
        <Tr t={tr.fsGeolocation} />
      </label>

      <span>
        <Tr t={tr.stateIsIncluded} />
        <a
          class="inline-block w-fit cursor-pointer"
          on:click={() => state.guistate.filtersPanelIsOpened.set(true)}
        >
          <Tr t={tr.openLayers} />
        </a>
      </span>

      <Tr cls="link-underline" t={tr.documentation} />
    </div>
  </AccordionSingle>
</div>
