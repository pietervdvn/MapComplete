<script lang="ts">
  import Locale from "../i18n/Locale";
  import LinkToWeblate from "./LinkToWeblate";

  /**
   * Shows a small icon which will open up weblate; a contributor can translate the item for 'context' there
   */
  export let context : string

  let linkToWeblate = Locale.showLinkToWeblate;
  let linkOnMobile = Locale.showLinkOnMobile;
  let language = Locale.language;

</script>


{#if context}
  {#if $linkOnMobile}
    <a href={LinkToWeblate.hrefToWeblate($language, context)} target="_blank" class="mx-1">
      <img src="./assets/svg/translate.svg" class="w-3 h-3 rounded-full font-gray" />
    </a>
  {:else if $linkToWeblate}
    <a href={LinkToWeblate.hrefToWeblate($language, context)} class="hidden-on-mobile mx-1" target="_blank">
      <img src="./assets/svg/translate.svg" class="w-3 h-3 rounded-full font-gray" />
    </a>
  {/if}
{/if}
