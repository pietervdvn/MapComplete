<script lang="ts">
    import {Translation} from "../i18n/Translation"
    import * as personal from "../../assets/themes/personal/personal.json"
    import {ImmutableStore, Store, UIEventSource} from "../../Logic/UIEventSource"
    import UserDetails, {OsmConnection} from "../../Logic/Osm/OsmConnection"
    import Constants from "../../Models/Constants"
    import type Loc from "../../Models/Loc"
    import type {LayoutInformation} from "../../Models/ThemeConfig/LayoutConfig"
    import Tr from "../Base/Tr.svelte"
    import SubtleLink from "../Base/SubtleLink.svelte";

    export let theme: LayoutInformation
    export let isCustom: boolean = false
    export let userDetails: UIEventSource<UserDetails>
    export let state: { osmConnection: OsmConnection; locationControl?: UIEventSource<Loc> }

    $: title = new Translation(
        theme.title,
        !isCustom && !theme.mustHaveLanguage ? "themes:" + theme.id + ".title" : undefined
    )
    $: description = new Translation(theme.shortDescription)

    // TODO: Improve this function
    function createUrl(
        layout: { id: string; definition?: string },
        isCustom: boolean,
        state?: { locationControl?: UIEventSource<{ lat; lon; zoom }>; layoutToUse?: { id } }
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

        const currentLocation = state?.locationControl

        let path = window.location.pathname
        // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
        path = path.substr(0, path.lastIndexOf("/"))
        // Path will now contain '/dir/dir', or empty string in case of nothing
        if (path === "") {
            path = "."
        }

        let linkPrefix = `${path}/${layout.id.toLowerCase()}.html?`
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.port === "1234") {
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

        return (
            currentLocation?.map((currentLocation) => {
                const params = [
                    ["z", currentLocation?.zoom],
                    ["lat", currentLocation?.lat],
                    ["lon", currentLocation?.lon],
                ]
                    .filter((part) => part[1] !== undefined)
                    .map((part) => part[0] + "=" + part[1])
                    .join("&")
                return `${linkPrefix}${params}${hash}`
            }) ?? new ImmutableStore<string>(`${linkPrefix}`)
        )
    }

    let href = createUrl(theme, isCustom, state)
</script>

{#if theme.id !== personal.id || $userDetails.csCount > Constants.userJourney.personalLayoutUnlock}
    <SubtleLink href={ $href  }>
        <img slot="image" src={theme.icon} class="block h-11 w-11 bg-red mx-4" alt=""/>
        <span class="flex flex-col text-ellipsis overflow-hidden">
          <Tr t={title}/>
          <span class="subtle max-h-12 truncate text-ellipsis">
            <Tr t={description}/>
          </span>
      </span>
    </SubtleLink>
{/if}
