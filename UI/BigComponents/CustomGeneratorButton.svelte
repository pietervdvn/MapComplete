<script lang="ts">
    import UserDetails from "../../Logic/Osm/OsmConnection"
    import {UIEventSource} from "../../Logic/UIEventSource"
    import Constants from "../../Models/Constants"
    import Svg from "../../Svg"
    import ToSvelte from "../Base/ToSvelte.svelte"
    import Translations from "../i18n/Translations"
    import SubtleLink from "../Base/SubtleLink.svelte";
    import Tr from "../Base/Tr.svelte";

    export let userDetails: UIEventSource<UserDetails>
    const t = Translations.t.general.morescreen

</script>

<div>
    {#if $userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock}
        <SubtleLink
                url="https://github.com/pietervdvn/MapComplete/issues"
                newTab={true}
        >
            <Tr t={t.requestATheme}/>
        </SubtleLink>
    {:else}
        <SubtleLink href="https://pietervdvn.github.io/mc/legacy/070/customGenerator.html">
          <span slot="image">
            <ToSvelte construct={Svg.pencil_svg().SetClass("h-11 w-11 mx-4 bg-red")}/>
          </span>
            <Tr t={t.createYourOwnTheme}/>
        </SubtleLink>
    {/if}
</div>
