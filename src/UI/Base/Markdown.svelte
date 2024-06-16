<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import { marked } from "marked"

  export let src: string = undefined
  export let srcWritable: Store<string> = undefined
  srcWritable?.addCallbackAndRunD((t) => {
    src = t
  })
  if (src !== undefined && typeof src !== "string") {
    console.trace("Got a non-string object in Markdown", src)
    throw "Markdown.svelte got a non-string object"
  }
</script>

{#if src?.length > 0}
  {@html marked.parse(src)}
{/if}
