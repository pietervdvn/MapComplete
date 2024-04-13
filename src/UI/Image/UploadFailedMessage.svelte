<script lang="ts">
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"

  export let failed: number
  const t = Translations.t.image
</script>

<div class="alert flex">
  <div class="flex flex-col items-start">
    {#if failed === 1}
      <Tr t={t.upload.one.failed} />
    {:else}
      <Tr t={t.upload.multiple.someFailed.Subs({ count: failed })} />
    {/if}
    <Tr cls="text-normal" t={t.upload.failReasons} />
    <Tr cls="text-xs" t={t.upload.failReasonsAdvanced} />
  </div>
  <button
    class="pointer-events-auto mt-2 h-fit shrink-0 rounded-full border-none p-0"
    on:click
    style="border: 0 !important; padding: 0 !important;"
  >
    <XCircleIcon aria-hidden={true} class="h-8 w-8" />
  </button>
</div>
