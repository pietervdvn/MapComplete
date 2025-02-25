<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store } from "../../Logic/UIEventSource"
  import { Changes } from "../../Logic/Osm/Changes"
  import Loading from "../Base/Loading.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { TagUtils } from "../../Logic/Tags/TagUtils"

  export let state: SpecialVisualizationState
  export let compact: boolean = true

  const changes: Changes = state.changes
  const isUploading: Store<boolean> = changes?.isUploading
  const errors = changes?.errors
  const pending = changes?.pendingChanges
</script>
{#if changes}
  <div
    class="pointer-events-auto flex flex-col"
    on:click={() => changes.flushChanges("Pending changes indicator clicked")}
  >
    {#if $isUploading}
      <Loading>
        <Tr cls="thx" t={Translations.t.general.uploadingChanges} />
      </Loading>
    {:else if $pending.length === 1}
      <Tr cls="alert" t={Translations.t.general.uploadPendingSingle} />
    {:else if $pending.length > 1}
      <Tr cls="alert" t={Translations.t.general.uploadPending.Subs({ count: $pending.length })} />
    {/if}

    {#each $errors as error}
      <Tr cls="alert" t={Translations.t.general.uploadError.Subs({ error })} />
    {/each}

    {#if !compact && $pending.length > 0}
      <button on:click={() => state.changes.pendingChanges.set([])}>
        <Tr t={Translations.t.general.clearPendingChanges} />
      </button>

      <ul>
        {#each $pending as pending}
          <li>
            {#if pending.changes !== undefined}
              Create {pending.type}/{pending.id}
              {JSON.stringify(TagUtils.KVObjtoProperties(pending.tags))}
            {:else}
              Modify {pending.type}/{pending.id} {JSON.stringify(pending.tags)}
            {/if}
            {#if pending.type === "way" && pending.changes?.nodes}
              {pending.changes.nodes.join(" ")}
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
