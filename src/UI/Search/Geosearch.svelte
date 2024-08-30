<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import Loading from "../Base/Loading.svelte"
  import Hotkeys from "../Base/Hotkeys"
  import { createEventDispatcher, onDestroy } from "svelte"
  import { placeholder } from "../../Utils/placeholder"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"

  import { focusWithArrows } from "../../Utils/focusWithArrows"
  import ThemeViewState from "../../Models/ThemeViewState"

  export let state: ThemeViewState
  export let searchContents: UIEventSource<string> = new UIEventSource<string>("")

  function performSearch() {
    state.searchState.performSearch()
  }

  let isRunning = state.searchState.isSearching

  let inputElement: HTMLInputElement

  export let isFocused = new UIEventSource(false)

  function focusOnSearch() {
    requestAnimationFrame(() => {
      inputElement?.focus()
      inputElement?.select()
    })
  }

  Hotkeys.RegisterHotkey({ ctrl: "F" }, Translations.t.hotkeyDocumentation.selectSearch, () => {
    state.searchState.feedback.set(undefined)
    focusOnSearch()
  })

  const dispatch = createEventDispatcher<{ searchCompleted; searchIsValid: boolean }>()
  $: {
    if (!$searchContents?.trim()) {
      dispatch("searchIsValid", false)
    } else {
      dispatch("searchIsValid", true)
    }
  }

  let geosearch: HTMLDivElement

  function checkFocus() {
    window.requestAnimationFrame(() => {
      if (geosearch?.contains(document.activeElement)) {
        return
      }
      isFocused.setData(false)
    })
  }

  document.addEventListener("focus", () => {
    checkFocus()
  }, true /* use 'capturing' instead of bubbling, needed for focus-events*/)


</script>

<div bind:this={geosearch} use:focusWithArrows={"searchresult"}>

  <div class="normal-background flex justify-between rounded-full pl-2 w-full">
    <form class="flex w-full flex-wrap">
      {#if $isRunning}
        <Loading>{Translations.t.general.search.searching}</Loading>
      {:else}
        <input
          type="search"
          class="w-full outline-none"
          bind:this={inputElement}
          on:keypress={(keypr) => {
            if(keypr.key === "Enter"){
              performSearch()
              keypr.preventDefault()
            }
            return undefined
        }}
          on:focus={() => {isFocused.setData(true)}}
          on:blur={() => {checkFocus()}}
          bind:value={$searchContents}
          use:placeholder={Translations.t.general.search.search}
          use:ariaLabel={Translations.t.general.search.search}
        />

      {/if}
    </form>
    <SearchIcon aria-hidden="true" class="h-6 w-6 self-end" on:click={() => performSearch()} />
  </div>
</div>
