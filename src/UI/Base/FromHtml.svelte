<script lang="ts">
  /**
   * Given an HTML string, properly shows this
   */
  import DOMPurify from 'dompurify';
  export let src: string
  
  let cleaned = DOMPurify.sanitize(src, { USE_PROFILES: { html: true }, 
    ADD_ATTR: ['target']  // Don't remove target='_blank'. Note that Utils.initDomPurify does add a hook which automatically adds 'rel=noopener'
  });
  
  
  let htmlElem: HTMLElement
  $: {
    if (htmlElem) {
      htmlElem.innerHTML = cleaned
    }
  }

  export let clss: string | undefined = undefined
</script>

{#if src !== undefined}
  <span bind:this={htmlElem} class={clss} />
{/if}
