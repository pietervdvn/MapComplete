<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Star from "../../assets/svg/Star.svelte"
  import Star_half from "../../assets/svg/Star_half.svelte"
  import Star_outline from "../../assets/svg/Star_outline.svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"

  export let score: number
  export let cutoff: number
  export let starSize = "w-h h-4"
  export let i: number
  export let readonly = false

  let dispatch = createEventDispatcher<{ hover: { score: number }; click: { score: number } }>()
  let container: HTMLElement

  function getScore(e: MouseEvent): number {
    if (e.clientX === 0 && e.clientY === 0) {
      console.log("Keyboard rated", cutoff)
      // Keyboard triggered 'click' -> return max value
      return cutoff
    }
    const x = e.clientX - e.target.getBoundingClientRect().x
    const w = container.getClientRects()[0]?.width
    return x / w < 0.5 ? cutoff - 10 : cutoff
  }
</script>

{#if readonly}
  {#if score >= cutoff}
    <Star class={starSize} />
  {:else if score + 10 >= cutoff}
    <Star_half class={starSize} />
  {:else}
    <Star_outline class={starSize} />
  {/if}
{:else}
  <button
    use:ariaLabel={Translations.t.reviews.rate.Subs({ n: i + 1 })}
    class="small soft no-image-background rounded-full"
    style="padding: 0; border: none;"
    bind:this={container}
    on:click={(e) => {
      console.log("Dispatching click", e)
      return dispatch("click", { score: getScore(e) })
    }}
    on:mousemove={(e) => dispatch("hover", { score: getScore(e) })}
  >
    {#if score >= cutoff}
      <Star class={starSize} />
    {:else if score + 10 >= cutoff}
      <Star_half class={starSize} />
    {:else}
      <Star_outline class={starSize} />
    {/if}
  </button>
{/if}
