<script lang="ts">
  /**
   * Input helper to create a tag. The tag is JSON-encoded
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import BasicTagInput from "../../Studio/TagInput/BasicTagInput.svelte"
  import { TagUtils } from "../../../Logic/Tags/TagUtils"
  import FromHtml from "../../Base/FromHtml.svelte"
  import Markdown from "../../Base/Markdown.svelte"
  export let value: UIEventSource<undefined | string>
  export let args: string[] = []
  let uploadableOnly: boolean = args[0] === "uploadableOnly"
  export let overpassSupportNeeded: boolean

  /**
   * Only show the taginfo-statistics if they are suspicious (thus: less then 250 entries)
   */
  export let silent: boolean = false
  let mode: string = "="
  let dropdownFocussed = new UIEventSource(false)
  let documentation = TagUtils.modeDocumentation[mode]
  $: documentation = TagUtils.modeDocumentation[mode]
</script>

<BasicTagInput
  bind:mode
  {dropdownFocussed}
  {overpassSupportNeeded}
  {silent}
  tag={value}
  {uploadableOnly}
  on:submit
/>
{#if $dropdownFocussed}
  <div class="m-2 border border-dashed border-black p-2">
    <b>{documentation.name}</b>
    <Markdown src={documentation.docs} />
  </div>
{/if}
