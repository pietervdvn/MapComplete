<script lang="ts">
    import UserDetails from "../../Logic/Osm/OsmConnection"
    import {UIEventSource} from "../../Logic/UIEventSource"
    import Constants from "../../Models/Constants"
    import Svg from "../../Svg"
    import SubtleButton from "../Base/SubtleButton.svelte"
    import ToSvelte from "../Base/ToSvelte.svelte"
    import Translations from "../i18n/Translations"

    export let userDetails: UIEventSource<UserDetails>
    const t = Translations.t.general.morescreen

    console.log($userDetails.csCount < 50)
</script>

<div>
    {#if $userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock}
        <SubtleButton
                options={{
        url: "https://github.com/pietervdvn/MapComplete/issues",
        newTab: true,
      }}
        >
            <span slot="message">{t.requestATheme.toString()}</span>
        </SubtleButton>
    {:else}
        <SubtleButton
                options={{
        url: "https://pietervdvn.github.io/mc/legacy/070/customGenerator.html",
      }}
        >
      <span slot="image">
        <ToSvelte construct={Svg.pencil_svg().SetClass("h-11 w-11 mx-4 bg-red")}/>
      </span>
            <span slot="message">{t.createYourOwnTheme.toString()}</span>
        </SubtleButton>
    {/if}
</div>
