<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource.js"

  /**
   * For some stupid reason, it is very hard to bind inputs
   */
  export let selected: UIEventSource<boolean>
  let _c: boolean = selected.data ?? true
  $: selected.setData(_c)
</script>

<input type="checkbox" bind:checked={_c} />
