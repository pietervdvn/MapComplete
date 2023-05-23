<script lang="ts">
    import {OsmConnection} from "../../Logic/Osm/OsmConnection"
    import {UIEventSource} from "../../Logic/UIEventSource"
    import type Loc from "../../Models/Loc"
    import * as themeOverview from "../../assets/generated/theme_overview.json"
    import {Utils} from "../../Utils"
    import ThemesList from "./ThemesList.svelte"
    import Translations from "../i18n/Translations"
    import {LayoutInformation} from "../../Models/ThemeConfig/LayoutConfig"
    import LoginToggle from "../Base/LoginToggle.svelte";

    export let search: UIEventSource<string>
    export let state: { osmConnection: OsmConnection; locationControl?: UIEventSource<Loc> }
    export let onMainScreen: boolean = true

    const prefix = "mapcomplete-hidden-theme-"
    const hiddenThemes: LayoutInformation[] = (themeOverview["default"] ?? themeOverview)?.filter(
        (layout) => layout.hideFromOverview
    ) ?? []
    const userPreferences = state.osmConnection.preferencesHandler.preferences
    const t = Translations.t.general.morescreen

    let knownThemesId: string[]
    $: knownThemesId = Utils.NoNull(
        Object.keys($userPreferences)
            .filter((key) => key.startsWith(prefix))
            .map((key) => key.substring(prefix.length, key.length - "-enabled".length))
    )
    $: console.log("Known theme ids:", knownThemesId)
    $: knownThemes = hiddenThemes.filter((theme) => knownThemesId.includes(theme.id))
</script>

<LoginToggle {state}>

    <ThemesList
            hideThemes={false}
            isCustom={false}
            {onMainScreen}
            {search}
            {state}
            themes={knownThemes}
    >
        <svelte:fragment slot="title">
            <h3>{t.previouslyHiddenTitle.toString()}</h3>
            <p>
                {t.hiddenExplanation.Subs({
                    hidden_discovered: knownThemes.length.toString(),
                    total_hidden: hiddenThemes.length.toString(),
                })}
            </p>
        </svelte:fragment>
    </ThemesList>

</LoginToggle>
