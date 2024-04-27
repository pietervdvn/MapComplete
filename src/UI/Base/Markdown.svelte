<script lang="ts">
  import markdownit from "markdown-it"
  import { UIEventSource } from "../../Logic/UIEventSource"
  const md = markdownit()
  export let src: string
  export let srcWritable: UIEventSource<string> = undefined
  srcWritable?.addCallbackAndRunD(t => {
    src = t
  })
  if(typeof src !== "string") {
    throw "Markdown.svelte got a non-string object"
  }
</script>
{#if src?.length > 0}
  {@html md.render(src)}
{/if}

