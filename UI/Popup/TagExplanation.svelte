<script lang="ts">/**
 * Shows an explanation about the given TagsFilter.
 */
import { TagsFilter } from "../../Logic/Tags/TagsFilter";
import FromHtml from "../Base/FromHtml.svelte";

export let tagsFilter: TagsFilter;
export let properties: Record<string, string> | undefined = {};
export let linkToWiki: boolean = false;
</script>

{#if tagsFilter !== undefined}
  <FromHtml src={tagsFilter.asHumanString(linkToWiki, false, properties)} />
{/if}
