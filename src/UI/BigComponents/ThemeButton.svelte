<script lang="ts">
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import type { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Marker from "../Map/Marker.svelte"

  export let theme: MinimalLayoutInformation & {isOfficial?: boolean}
  let isCustom: boolean = theme.id.startsWith("https://") || theme.id.startsWith("http://")
  export let state: { layoutToUse?: { id: string }; osmConnection: OsmConnection }

  $: title = Translations.T(
    theme.title,
    !isCustom && !theme.mustHaveLanguage ? "themes:" + theme.id + ".title" : undefined
  )
  $: description = Translations.T(theme.shortDescription)

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

  <a class="low-interaction my-1 flex w-full items-center text-ellipsis rounded p-1" href={$href}>
    <Marker icons={theme.icon} size="block h-8 w-8 sm:h-11 sm:w-11 m-1 sm:mx-2 md:mx-4 shrink-0" />

    <span class="flex flex-col overflow-hidden text-ellipsis text-xl font-bold">
      <Tr cls="" t={title} />
      <Tr cls="subtle text-base" t={description} />
      <slot/>
    </span>
  </a>
