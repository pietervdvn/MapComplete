<script lang="ts">
  import Locale from "../i18n/Locale"
  import LinkToWeblate from "./LinkToWeblate"
  import Translate from "../../assets/svg/Translate.svelte"

  /**
   * Shows a small icon which will open up weblate; a contributor can translate the item for 'context' there
   */
  export let context: string

  let linkToWeblate = Locale.showLinkToWeblate
  let linkOnMobile = Locale.showLinkOnMobile
  let language = Locale.language
</script>

{#if !!context && context.indexOf(":") > 0}
  {#if $linkOnMobile}
    <a
      href={LinkToWeblate.hrefToWeblate($language, context)}
      target="_blank"
      class="weblate-link mx-1"
      tabindex="-1"
    >
      <Translate class="font-gray" />
    </a>
  {:else if $linkToWeblate}
    <a
      href={LinkToWeblate.hrefToWeblate($language, context)}
      class="weblate-link hidden-on-mobile mx-1"
      target="_blank"
      tabindex="-1"
    >
      <Translate class="font-gray inline-block" />
    </a>
  {/if}
{/if}
