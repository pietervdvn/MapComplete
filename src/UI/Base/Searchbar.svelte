<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import { createEventDispatcher } from "svelte"
  import { placeholder as set_placeholder } from "../../Utils/placeholder"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { Translation } from "../i18n/Translation"
  import Backspace from "@babeard/svelte-heroicons/outline/Backspace"
  import { AndroidPolyfill } from "../../Logic/Web/AndroidPolyfill"

  export let value: UIEventSource<string>
  let _value = value.data ?? ""
  value.addCallbackD((v) => {
    _value = v
  })
  $: value.set(_value)

  const dispatch = createEventDispatcher<{ search }>()
  export let placeholder: Translation = Translations.t.general.search.search
  export let isFocused: UIEventSource<boolean> = undefined
  let inputElement: HTMLInputElement

  export let autofocus = false

  isFocused?.addCallback((focussed) => {
    if (focussed) {
      requestAnimationFrame(() => {
        if (document.activeElement !== inputElement) {
          inputElement?.focus()
          inputElement?.select()
        }
      })
    } else if (document.activeElement === inputElement) {
      inputElement?.blur()
    }
  })

  if (autofocus) {
    isFocused.set(true)
  }
  let isAndroid = AndroidPolyfill.inAndroid
</script>

<form class="w-full" on:submit|preventDefault={() => dispatch("search")}>
  <label
    class="neutral-label normal-background box-shadow flex w-full items-center rounded-full border border-black"
  >
    <SearchIcon aria-hidden="true" class="ml-2 h-8 w-8" />

    <input
      bind:this={inputElement}
      on:focus={() => {
        isFocused?.setData(true)
      }}
      on:blur={() => {
        isFocused?.setData(false)
      }}
      type="search"
      style=" --tw-ring-color: rgb(0 0 0 / 0) !important;"
      class="ml-1 w-full border-none px-0 outline-none"
      on:keypress={(keypr) => {
        return keypr.key === "Enter" ? dispatch("search") : undefined
      }}
      bind:value={_value}
      use:set_placeholder={placeholder}
      use:ariaLabel={placeholder}
    />
    <!-- Show a 'clear field' icon in the searchbar. The android-build already provides this for us, hence the outer if -->
    {#if !$isAndroid && $value.length > 0}
      <Backspace
        on:click={(e) => {
          value.set("")
          e.preventDefault()
        }}
        color="var(--button-background)"
        class="mr-3 h-6 w-6 cursor-pointer"
      />
    {:else}
      <div class="mr-3 w-6" />
    {/if}
  </label>
</form>
