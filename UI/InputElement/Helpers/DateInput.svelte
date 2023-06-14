<script lang="ts">
  /**
   * Simple wrapper around the HTML-date field.
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"

  export let value: UIEventSource<undefined | string>
</script>

<input bind:value={$value} type="date" />
