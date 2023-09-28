<script lang="ts">

  import ToSvelte from "../Base/ToSvelte.svelte";
  import Svg from "../../Svg";
  import { createEventDispatcher } from "svelte";

  export let score: number;
  export let cutoff: number;
  export let starSize = "w-h h-4";

  let dispatch = createEventDispatcher<{ hover: { score: number } }>();
  let container: HTMLElement;

  function getScore(e: MouseEvent): number {
    const x = e.clientX - e.target.getBoundingClientRect().x;
    const w = container.getClientRects()[0]?.width;
    return (x / w) < 0.5 ? cutoff - 10 : cutoff;
  }

</script>

<div bind:this={container} on:click={(e) => dispatch("click", {score: getScore(e)})}
     on:mousemove={(e) => dispatch("hover", { score: getScore(e) })}>

  {#if score >= cutoff}
    <ToSvelte construct={Svg.star_svg().SetClass(starSize)} />
  {:else if score + 10 >= cutoff}
    <ToSvelte construct={Svg.star_half_svg().SetClass(starSize)} />
  {:else}
    <ToSvelte construct={Svg.star_outline_svg().SetClass(starSize)} />
  {/if}
</div>
