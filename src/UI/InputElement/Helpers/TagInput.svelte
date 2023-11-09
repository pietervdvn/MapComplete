<script lang="ts">
  /**
   * Input helper to create a tag. The tag is JSON-encoded
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import type { TagConfigJson } from "../../../Models/ThemeConfig/Json/TagConfigJson"
  import FullTagInput from "../../Studio/TagInput/FullTagInput.svelte"

  export let value: UIEventSource<TagConfigJson>
  export let uploadableOnly: boolean
  export let overpassSupportNeeded: boolean

  /**
   * Only show the taginfo-statistics if they are suspicious (thus: less then 250 entries)
   */
  export let silent: boolean = false

  let tag: UIEventSource<string | TagConfigJson> = value
</script>

<FullTagInput {overpassSupportNeeded} {silent} {tag} {uploadableOnly} on:submit />
