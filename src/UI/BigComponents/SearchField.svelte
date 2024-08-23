<script lang="ts">
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import Loading from "../Base/Loading.svelte"
  import Hotkeys from "../Base/Hotkeys"
  import { createEventDispatcher, onDestroy } from "svelte"
  import { placeholder } from "../../Utils/placeholder"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { Translation } from "../i18n/Translation"

  const dispatch = createEventDispatcher<{ search: string }>()

  export let searchValue: UIEventSource<string>
  export let placeholderText: Translation = Translations.t.general.search.search
  export let feedback = new UIEventSource<string>(undefined)

  let isRunning: boolean = false

  let inputElement: HTMLInputElement

  function _performSearch() {
    dispatch("search", searchValue.data)
  }
</script>

<div class="normal-background flex justify-between rounded-full">
  <form class="flex w-full flex-wrap" on:submit|preventDefault={() => {}}>
    {#if isRunning}
      <Loading>{Translations.t.general.search.searching}</Loading>
    {:else}
      <div class="flex w-full rounded-full border border-gray-300">
        <input
          type="search"
          class="mx-2 w-full outline-none"
          bind:this={inputElement}
          on:keypress={(keypr) => {
            feedback.set(undefined)
            return keypr.key === "Enter" ? _performSearch() : undefined
          }}
          bind:value={$searchValue}
          use:placeholder={placeholderText}
          use:ariaLabel={Translations.t.general.search.search}
        />
        <SearchIcon
          aria-hidden="true"
          class="h-6 w-6 self-end"
          on:click={(event) => _performSearch()}
        />
      </div>
      {#if $feedback !== undefined}
        <!-- The feedback is _always_ shown for screenreaders and to make sure that the searchfield can still be selected by tabbing-->
        <div class="alert" role="alert" aria-live="assertive">
          {$feedback}
        </div>
      {/if}
    {/if}
  </form>
</div>
