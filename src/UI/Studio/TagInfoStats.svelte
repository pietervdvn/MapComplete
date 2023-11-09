<script lang="ts">
  /**
   * A small component showing statistics from tagInfo.
   * Will show this in an 'alert' if very little (<250) tags are known
   */
  import { TagUtils } from "../../Logic/Tags/TagUtils"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { TagInfoStats } from "../../Logic/Web/TagInfo"
  import TagInfo from "../../Logic/Web/TagInfo"
  import { twMerge } from "tailwind-merge"
  import Loading from "../Base/Loading.svelte"

  export let silent = false
  export let tag: UIEventSource<string>
  const tagStabilized = tag.stabilized(500)
  const tagInfoStats: Store<TagInfoStats> = tagStabilized.bind((tag) => {
    if (!tag) {
      return undefined
    }
    try {
      const t = TagUtils.Tag(tag)
      const k = t["key"]
      let v = t["value"]
      if (typeof v !== "string") {
        v = undefined
      }
      if (!k) {
        return undefined
      }
      return UIEventSource.FromPromise(TagInfo.global.getStats(k, v))
    } catch (e) {
      return undefined
    }
  })
  const tagInfoUrl: Store<string> = tagStabilized.mapD((tag) => {
    try {
      const t = TagUtils.Tag(tag)
      const k = t["key"]
      let v = t["value"]
      if (typeof v !== "string") {
        v = undefined
      }
      if (!k) {
        return undefined
      }
      return TagInfo.global.webUrl(k, v)
    } catch (e) {
      return undefined
    }
  })
  const total = tagInfoStats.mapD((data) => data.data.find((i) => i.type === "all").count)
</script>

{#if $tagStabilized !== $tag}
  {#if !silent}
    <Loading />
  {/if}
{:else if $tagInfoStats && (!silent || $total < 250)}
  <a
    href={$tagInfoUrl}
    target="_blank"
    class={twMerge($total < 250 ? "alert" : "thanks", "link-underline w-fit")}
  >
    {$total} features have
    <span class="literal-code">{$tag}</span>
  </a>
{/if}
