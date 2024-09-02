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
  export let placeholder: Translation =  Translations.t.general.search.search
</script>


<form
  class="flex justify-center"
  on:submit|preventDefault={() => dispatch("search")}
>
  <label
    class="neutral-label my-2 flex w-full items-center rounded-full border-2 border-black sm:w-1/2  box-shadow"
  >
    <input
      type="search"
      style=" --tw-ring-color: rgb(0 0 0 / 0) !important;"
      class="ml-4 pl-1 w-full outline-none border-none"
      on:keypress={(keypr) => {
          return keypr.key === "Enter" ? dispatch("search") : undefined
        }}
      bind:value={_value}
      use:set_placeholder={placeholder}
      use:ariaLabel={Translations.t.general.search.search}
    />
    <SearchIcon aria-hidden="true" class="h-8 w-8 mx-2" />

  </label>
</form>
