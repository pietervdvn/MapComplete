<script lang="ts">
  /**
   * Shows information about how much images are uploaded for the given feature
   *
   * Either pass in a store with tags or a featureId.
   */

  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import Loading from "../Base/Loading.svelte"

  export let state: SpecialVisualizationState
  export let tags: Store<OsmTags> = undefined
  export let featureId = tags?.data?.id
  if (featureId === undefined) {
    throw "No tags or featureID given"
  }
  export let showThankYou: boolean = true
  const { uploadStarted, uploadFinished, retried, failed } =
    state.imageUploadManager.getCountsFor(featureId)
  const t = Translations.t.image
</script>

{#if $uploadStarted === 1}
  {#if $uploadFinished === 1}
    {#if showThankYou}
      <Tr cls="thanks" t={t.upload.one.done} />
    {/if}
  {:else if $failed === 1}
    <div class="alert flex flex-col">
      <Tr cls="self-center" t={t.upload.one.failed} />
      <Tr t={t.upload.failReasons} />
      <Tr t={t.upload.failReasonsAdvanced} />
    </div>
  {:else if $retried === 1}
    <div class="alert">
    <Loading>
      <Tr t={t.upload.one.retrying} />
    </Loading>
    </div>
  {:else}
    <div class="alert">
    <Loading>
      <Tr t={t.upload.one.uploading} />
    </Loading>
    </div>
  {/if}
{:else if $uploadStarted > 1}
  {#if $uploadFinished + $failed === $uploadStarted && $uploadFinished > 0}
    {#if showThankYou}
      <Tr cls="thanks" t={t.upload.multiple.done.Subs({ count: $uploadFinished })} />
    {/if}
  {:else if $uploadFinished === 0}
    <Loading cls="alert">
      <Tr t={t.upload.multiple.uploading.Subs({ count: $uploadStarted })} />
    </Loading>
  {:else if $uploadFinished > 0}
    <Loading cls="alert">
      <Tr
        t={t.upload.multiple.partiallyDone.Subs({
          count: $uploadStarted - $uploadFinished,
          done: $uploadFinished,
        })}
      />
    </Loading>
  {/if}
  {#if $failed > 0}
    <div class="alert flex flex-col">
      {#if $failed === 1}
        <Tr cls="self-center" t={t.upload.one.failed} />
      {:else}
        <Tr cls="self-center" t={t.upload.multiple.someFailed.Subs({ count: $failed })} />
      {/if}
      <Tr t={t.upload.failReasons} />
      <Tr t={t.upload.failReasonsAdvanced} />
    </div>
  {/if}
{/if}
