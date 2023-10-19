<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store } from "../../Logic/UIEventSource"
  import { Changes } from "../../Logic/Osm/Changes"
  import Loading from "../Base/Loading.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let state: SpecialVisualizationState

  const changes: Changes = state.changes
  const isUploading: Store<boolean> = changes.isUploading
  const pendingChangesCount: Store<number> = changes.pendingChanges.map((ls) => ls.length)
  const errors = changes.errors
</script>

<div
  class="pointer-events-auto flex flex-col"
  on:click={() => changes.flushChanges("Pending changes indicator clicked")}
>
  {#if $isUploading}
    <Loading>
      <Tr cls="thx" t={Translations.t.general.uploadingChanges} />
    </Loading>
  {:else if $pendingChangesCount === 1}
    <Tr cls="alert" t={Translations.t.general.uploadPendingSingle} />
  {:else if $pendingChangesCount > 1}
    <Tr
      cls="alert"
      t={Translations.t.general.uploadPending.Subs({ count: $pendingChangesCount })}
    />
  {/if}

  {#each $errors as error}
    <Tr cls="alert" t={Translations.t.general.uploadError.Subs({ error })} />
  {/each}
</div>
