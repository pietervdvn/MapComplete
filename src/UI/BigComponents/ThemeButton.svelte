<script lang="ts">
  import { Translation } from "../i18n/Translation"
  import * as personal from "../../../assets/themes/personal/personal.json"
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
  import UserDetails, { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Constants from "../../Models/Constants"
  import type { LayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"

  export let theme: LayoutInformation
  export let isCustom: boolean = false
  export let userDetails: UIEventSource<UserDetails>
  export let state: { layoutToUse?: { id: string }; osmConnection: OsmConnection }
  export let selected: boolean = false

  let unlockedPersonal = LocalStorageSource.GetParsed("unlocked_personal_theme", false)

  userDetails.addCallbackAndRunD((userDetails) => {
    if (!userDetails.loggedIn) {
      return
    }
    if (userDetails.csCount > Constants.userJourney.personalLayoutUnlock) {
      unlockedPersonal.setData(true)
    }
    return true
  })

  $: title = new Translation(
    theme.title,
    !isCustom && !theme.mustHaveLanguage ? "themes:" + theme.id + ".title" : undefined
  )
  $: description = new Translation(theme.shortDescription)

  // TODO: Improve this function
  function createUrl(
    layout: { id: string; definition?: string },
    isCustom: boolean,
    state?: { layoutToUse?: { id } }
  ): Store<string> {
    if (layout === undefined) {
      return undefined
    }
    if (layout.id === undefined) {
      console.error("ID is undefined for layout", layout)
      return undefined
    }

    if (layout.id === state?.layoutToUse?.id) {
      return undefined
    }

    let path = window.location.pathname
    // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
    path = path.substr(0, path.lastIndexOf("/"))
    // Path will now contain '/dir/dir', or empty string in case of nothing
    if (path === "") {
      path = "."
    }

    let linkPrefix = `${path}/${layout.id.toLowerCase()}.html?`
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.port === "1234"
    ) {
      // Redirect to 'theme.html?layout=* instead of 'layout.html'. This is probably a debug run, where the routing does not work
      linkPrefix = `${path}/theme.html?layout=${layout.id}&`
    }

    if (isCustom) {
      linkPrefix = `${path}/theme.html?userlayout=${layout.id}&`
    }

    let hash = ""
    if (layout.definition !== undefined) {
      hash = "#" + btoa(JSON.stringify(layout.definition))
    }

    return new ImmutableStore<string>(`${linkPrefix}${hash}`)
  }

  let href = createUrl(theme, isCustom, state)
</script>

{#if theme.id !== personal.id || $unlockedPersonal}
  <a class={"button theme-button w-full text-ellipsis"} href={$href}>
    <img src={theme.icon} class="m-1 mr-2 block h-11 w-11 sm:m-2 sm:mr-4" alt="" />
    <span class="flex flex-col overflow-hidden text-ellipsis">
      <Tr t={title} />

      {#if selected}
        <span class="thanks hidden-on-mobile" aria-hidden="true">
          <Tr t={Translations.t.general.morescreen.enterToOpen} />
        </span>
      {/if}
    </span>
  </a>
{/if}
