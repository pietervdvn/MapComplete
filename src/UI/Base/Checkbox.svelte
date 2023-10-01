<script lang="ts">
  import type { Writable } from "svelte/store"

  /**
   * For some stupid reason, it is very hard to bind inputs
   */
  export let selected: Writable<boolean>
  let _c: boolean = selected.data ?? true
  $: selected.set(_c)
</script>

<label class="no-image-background flex gap-1">
  <input bind:checked={_c} type="checkbox" />
  <slot />
</label>
