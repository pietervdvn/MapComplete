<script lang="ts">
  // Testing grounds
  import { UIEventSource } from "../Logic/UIEventSource"
  import SlopeInput from "./InputElement/Helpers/SlopeInput.svelte"
  let value: UIEventSource<string> = new UIEventSource(undefined)
</script>

<div class="w-full flex flex-col">
  <div>Value: {$value}</div>
</div>
<SlopeInput {value}></SlopeInput>
