<script lang="ts">
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Svg from "../../Svg"
  import { createEventDispatcher } from "svelte"
  import Star from "../../assets/svg/Star.svelte"
  import Star_half from "../../assets/svg/Star_half.svelte"
  import Star_outline from "../../assets/svg/Star_outline.svelte"

  export let score: number
  export let cutoff: number
  export let starSize = "w-h h-4"
  export let i: number

  let dispatch = createEventDispatcher<{ hover: { score: number },  click: { score: number } }>()
  let container: HTMLElement

  function getScore(e: MouseEvent): number {
    const x = e.clientX - e.target.getBoundingClientRect().x
    const w = container.getClientRects()[0]?.width
    return x / w < 0.5 ? cutoff - 10 : cutoff
  }
</script>

<div
  bind:this={container}
  on:click={(e) => dispatch("click", { score: getScore(e) })}
  on:mousemove={(e) => dispatch("hover", { score: getScore(e) })}
>
  {#if score >= cutoff}
    <Star class={starSize} />
  {:else if score + 10 >= cutoff}
    <Star_half class={starSize} />
  {:else}
    <Star_outline class={starSize} />
  {/if}
</div>
