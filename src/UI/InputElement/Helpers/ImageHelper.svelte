<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource"

  /**
   * Simply shows the image
   */
  export let value: UIEventSource<undefined | string>
</script>

<img src={$value} />
