<script lang="ts">
  /**
   * An element input a tag; has `and`, `or`, `regex`, ...
   */
  import type { TagConfigJson } from "../../../Models/ThemeConfig/Json/TagConfigJson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import TagExpression from "../TagExpression.svelte"

  export let tag: UIEventSource<string | TagConfigJson>
  export let uploadableOnly: boolean
  export let overpassSupportNeeded: boolean
  export let silent: boolean
</script>

<div class="m-2">
  <TagExpression {silent} {overpassSupportNeeded} {tag} {uploadableOnly} on:submit>
    <slot name="delete" slot="delete" />
  </TagExpression>
</div>
