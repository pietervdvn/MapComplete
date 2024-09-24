<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import { createEventDispatcher } from "svelte"
  import { placeholder as set_placeholder } from "../../Utils/placeholder"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { Translation } from "../i18n/Translation"
  import Backspace from "@babeard/svelte-heroicons/outline/Backspace"

  export let value: UIEventSource<string>
  let _value = value.data ?? ""
  value.addCallbackD(v => {
    _value = v
  })
  $: value.set(_value)

  const dispatch = createEventDispatcher<{ search }>()
  export let placeholder: Translation = Translations.t.general.search.search
  export let isFocused: UIEventSource<boolean> = undefined
  let inputElement: HTMLInputElement

  export let autofocus = false

  isFocused?.addCallback(focussed => {
    if (focussed) {
      requestAnimationFrame(() => {
        if (document.activeElement !== inputElement) {
          inputElement?.focus()
          inputElement?.select()
        }
      })
    }
  })

  if(autofocus){
    isFocused.set(true)
  }

</script>


<form
  class="w-full"
  on:submit|preventDefault={() => dispatch("search")}
>
  <label
    class="neutral-label normal-background flex w-full items-center rounded-full border border-black box-shadow"
  >
    <SearchIcon aria-hidden="true" class="h-8 w-8 ml-2" />

    <input
      bind:this={inputElement}
      on:focus={() => {isFocused?.setData(true)}}
      on:blur={() => {isFocused?.setData(false)}}
      type="search"
      style=" --tw-ring-color: rgb(0 0 0 / 0) !important;"
      class="px-0 ml-1 w-full outline-none border-none"
      on:keypress={(keypr) => {
          return keypr.key === "Enter" ? dispatch("search") : undefined
        }}
      bind:value={_value}
      use:set_placeholder={placeholder}
      use:ariaLabel={placeholder}
    />

    {#if $value.length > 0}
      <Backspace on:click={() => value.set("")} color="var(--button-background)" class="w-6 h-6 mr-3 cursor-pointer" />
    {:else}
      <div class="w-6 mr-3" />
    {/if}
  </label>
</form>
