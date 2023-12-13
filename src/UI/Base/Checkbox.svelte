<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"

  /**
   * For some stupid reason, it is very hard to bind inputs
   */
  export let selected: UIEventSource<boolean>
  let _c: boolean = selected.data ?? true
  $: selected.set(_c)
</script>

<label class="no-image-background flex items-center gap-1">
  <input bind:checked={_c} type="checkbox" />
  <slot />
</label>
