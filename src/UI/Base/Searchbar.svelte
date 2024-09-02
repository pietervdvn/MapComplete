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
  value.addCallbackD((v) => {
    _value = v
  })
  $: value.set(_value)

  const dispatch = createEventDispatcher<{ search }>()
  export let placeholder: Translation = Translations.t.general.search.search
</script>

<form class="flex justify-center" on:submit|preventDefault={() => dispatch("search")}>
  <label
    class="neutral-label box-shadow my-2 flex w-full items-center rounded-full border-2 border-black sm:w-1/2"
  >
    <input
      type="search"
      style=" --tw-ring-color: rgb(0 0 0 / 0) !important;"
      class="ml-4 w-full border-none pl-1 outline-none"
      on:keypress={(keypr) => {
        return keypr.key === "Enter" ? dispatch("search") : undefined
      }}
      bind:value={_value}
      use:set_placeholder={placeholder}
      use:ariaLabel={Translations.t.general.search.search}
    />
    <SearchIcon aria-hidden="true" class="mx-2 h-8 w-8" />
  </label>
</form>
