<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import { createEventDispatcher } from "svelte"
  import { placeholder as set_placeholder } from "../../Utils/placeholder"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { Translation } from "../i18n/Translation"

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

  isFocused?.addCallback(focussed => {
    if (focussed) {
      requestAnimationFrame(() => {
        if (document.activeElement !== inputElement) {
          inputElement.focus()
          inputElement.select()
        }
      })
    }
  })

</script>


<form
  class="w-full"
  on:submit|preventDefault={() => dispatch("search")}
>
  <label
    class="neutral-label normal-background flex w-full items-center rounded-full border-2 border-black box-shadow"
  >
    <input
      bind:this={inputElement}
      on:focus={() => {isFocused?.setData(true)}}
      on:blur={() => {isFocused?.setData(false)}}
      type="search"
      style=" --tw-ring-color: rgb(0 0 0 / 0) !important;"
      class="ml-4 pl-1 w-full outline-none border-none"
      on:keypress={(keypr) => {
          return keypr.key === "Enter" ? dispatch("search") : undefined
        }}
      bind:value={_value}
      use:set_placeholder={placeholder}
      use:ariaLabel={placeholder}
    />
    <SearchIcon aria-hidden="true" class="h-8 w-8 mx-3" />

  </label>
</form>
