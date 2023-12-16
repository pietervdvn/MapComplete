<script lang="ts">
  // Testing grounds
  import { UIEventSource } from "../Logic/UIEventSource"
  import SlopeInput from "./InputElement/Helpers/SlopeInput.svelte"
  import OrientationDebugPanel from "./Debug/OrientationDebugPanel.svelte"
  let value: UIEventSource<string> = new UIEventSource(undefined)
</script>

<OrientationDebugPanel/>
<SlopeInput />
