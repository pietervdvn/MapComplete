<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import type { MinimalThemeInformation } from "../../Models/ThemeConfig/ThemeConfig"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Marker from "../Map/Marker.svelte"
  import { AndroidPolyfill } from "../../Logic/Web/AndroidPolyfill"

  export let theme: MinimalThemeInformation & { isOfficial?: boolean }
  let isCustom: boolean = theme.id.startsWith("https://") || theme.id.startsWith("http://")
  export let state: { layoutToUse?: { id: string }; osmConnection: OsmConnection }
  export let iconOnly: boolean = false
  $: title = Translations.T(
    theme.title,
    !isCustom && !theme.mustHaveLanguage ? "themes:" + theme.id + ".title" : undefined
  )
  $: description = Translations.T(theme.shortDescription)

  function createUrlDirect(
    layout: { id: string; definition?: string },
    isCustom: boolean,
    isAndroid: boolean,
    state?: { layoutToUse?: { id } }
  ): string {
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
      !isAndroid &&
      (location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        location.port === "1234")
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

    return `${linkPrefix}${hash}`
  }

  let href = AndroidPolyfill.inAndroid.map((isAndroid) =>
    createUrlDirect(theme, isCustom, isAndroid, state)
  )
</script>

{#if iconOnly}
  <a class="low-interaction my-1 rounded p-1" href={$href}>
    <Marker icons={theme.icon} size="w-8 h-8 sm:w-11 sm:h-11" />
  </a>
{:else}
  <a class="low-interaction my-1 flex w-full items-center text-ellipsis rounded p-1" href={$href}>
    <Marker icons={theme.icon} size="block h-8 w-8 sm:h-11 sm:w-11 m-1 sm:mx-2 md:mx-4 shrink-0" />
    <span class="flex flex-col overflow-hidden text-ellipsis text-xl font-bold">
      <Tr cls="" t={title} />
      <Tr cls="subtle text-base" t={description} />
      <slot />
    </span>
  </a>
{/if}
