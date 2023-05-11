<script lang="ts">
    import {TagsFilter} from "../../Logic/Tags/TagsFilter";
    import FromHtml from "../Base/FromHtml.svelte";
    import Constants from "../../Models/Constants.js";
    import {Translation} from "../i18n/Translation";
    import Tr from "../Base/Tr.svelte";
    import {onDestroy} from "svelte";
    import type {SpecialVisualizationState} from "../SpecialVisualization";

    /**
     * A 'TagHint' will show the given tags in a human readable form.
     * Depending on the options, it'll link through to the wiki or might be completely hidden
     */
    export let tags: TagsFilter;
    export let state: SpecialVisualizationState;
    /**
     * If given, this function will be called to embed the given tags hint into this translation
     */
    export let embedIn: (() => Translation) | undefined = undefined;
    const userDetails = state.osmConnection.userDetails;
    let linkToWiki = false;
    onDestroy(state.osmConnection.userDetails.addCallbackAndRunD(userdetails => {
        linkToWiki = userdetails.csCount > Constants.userJourney.tagsVisibleAndWikiLinked;
    }));
    let tagsExplanation = "";
    $: tagsExplanation = tags?.asHumanString(linkToWiki, false, {});
</script>

{#if $userDetails.loggedIn}
    <div>
        {#if tags === undefined}
            <slot name="no-tags">
                No tags
            </slot>
        {:else if embedIn === undefined}
            <FromHtml src={tagsExplanation}/>
        {:else}
            <Tr t={embedIn(tagsExplanation)}/>
        {/if}
    </div>
{/if}
