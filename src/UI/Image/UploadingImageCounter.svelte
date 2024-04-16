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
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"
  import UploadFailedMessage from "./UploadFailedMessage.svelte"

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
  const debugging = state.featureSwitches.featureSwitchIsDebugging
  let dismissed = 0
</script>

{#if $debugging}
  <div class="low-interaction">
    Started {$uploadStarted} Done {$uploadFinished} Retry {$retried} Err {$failed}
  </div>
{/if}
{#if dismissed === $uploadStarted}
  <!-- We don't show anything as we ignore this number of failed items-->
{:else if $uploadStarted === 1}
  {#if $uploadFinished === 1}
    {#if showThankYou}
      <Tr cls="thanks" t={t.upload.one.done} />
    {/if}
  {:else if $failed === 1}
    <UploadFailedMessage failed={$failed} on:click={() => (dismissed = $failed)} />
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
  {#if $uploadFinished + $failed === $uploadStarted}
    {#if $uploadFinished === 0}
      <!-- pass -->
    {:else if showThankYou}
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
    <UploadFailedMessage failed={$failed} on:click={() => (dismissed = $failed)} />
  {/if}
{/if}
