<script lang="ts">
  import Mapillary from "../../assets/svg/Mapillary.svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../../UI/i18n/Translations"

  /**
   * Accessible, linked mapillary icon
   */
  export let url: string = undefined
</script>

{#if url}
  <a
    href={url}
    use:ariaLabel={Translations.t.general.attribution.seeOnMapillary}
    target="_blank"
    rel="noopener nofollower"
  >
    <Mapillary />
  </a>
{:else}
  <Mapillary />
{/if}
