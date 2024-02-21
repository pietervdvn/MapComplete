<script lang="ts">
  import EditLayerState from "./EditLayerState"
  import type { ConfigMeta } from "./configMeta"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import TranslationInput from "../InputElement/Helpers/TranslationInput.svelte"

  export let state: EditLayerState
  export let path: (string | number)[] = []
  let value = new UIEventSource<Record<string, string>>({})
  console.log("Registering translation to path", path)
  state.register(
    path,
    value.mapD(() => JSON.parse(value.data))
  )
</script>

<TranslationInput {value} />
