<script lang="ts">
  import { TagsFilter } from "../../Logic/Tags/TagsFilter"
  import FromHtml from "../Base/FromHtml.svelte"
  import { Translation } from "../i18n/Translation"
  import Tr from "../Base/Tr.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Translations from "../i18n/Translations"

  /**
   * A 'TagHint' will show the given tags in a human readable form.
   * Depending on the options, it'll link through to the wiki or might be completely hidden
   */
  export let tags: TagsFilter
  export let state: SpecialVisualizationState

  export let currentProperties: Record<string, string | any> = {}
  /**
   * If given, this function will be called to embed the given tags hint into this translation
   */
  export let embedIn: ((string: string) => Translation) | undefined = undefined
  const userDetails = state?.osmConnection?.userDetails
  let tagsExplanation = ""
  $: tagsExplanation = tags?.asHumanString(true, false, currentProperties)
</script>

{#if !userDetails || $userDetails.loggedIn}
  <div class="break-words" style="word-break: break-word">
    {#if tags === undefined}
      <slot name="no-tags"><Tr cls="subtle" t={Translations.t.general.noTagsSelected} /></slot>
    {:else if embedIn === undefined}
      <FromHtml src={tagsExplanation} />
    {:else}
      <Tr t={embedIn(tagsExplanation)} />
    {/if}
  </div>
{/if}
