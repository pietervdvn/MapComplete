<script lang="ts">
  /**
   * Given an HTML string, properly shows this
   */

  export let src: string
  let htmlElem: HTMLElement
  $: {
    if (htmlElem) {
      htmlElem.innerHTML = src
    }
  }

  export let clss: string | undefined = undefined
</script>

{#if src !== undefined}
  <span bind:this={htmlElem} class={clss} />
{/if}
