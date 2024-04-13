<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"

  /**
   * For some stupid reason, it is very hard to bind inputs
   */
  export let selected: UIEventSource<boolean>
  let _c: boolean = selected.data ?? true
  let id = `checkbox-input-${Math.round(Math.random() * 100000000)}`
  $: selected.set(_c)
  selected.addCallbackD((s) => {
    _c = s
  })
</script>

<label class="no-image-background flex items-center gap-1">
  <input bind:checked={_c} type="checkbox" {id} />
  <slot />
</label>
