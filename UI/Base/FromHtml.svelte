<script lang="ts">
  /**
   * Given an HTML string, properly shows this
   */

  export let src: string;
  let htmlElem: HTMLElement;
  $: {
    if(htmlElem !== undefined){
    htmlElem.innerHTML = src
    }
  }

</script>

{#if src !== undefined}
  <span bind:this={htmlElem}></span>
{/if}

