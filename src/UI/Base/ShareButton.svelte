<script lang="ts">
  import Share from "../../assets/svg/Share.svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"

  export let generateShareData: () => {
    text: string
    title: string
    url: string
  }
  export let text: string
  let isIcon = text === undefined || text === ""

  function share() {
    if (!navigator.share) {
      console.log("web share not supported")
      return
    }
    navigator
      .share(generateShareData())
      .then(() => {
        console.log("Thanks for sharing!")
      })
      .catch((err) => {
        console.log(`Couldn't share because of`, err.message)
      })
  }
</script>

{#if isIcon}
  <button
    on:click={share}
    class="soft no-image-background m-0 h-8 w-8 p-0"
    use:ariaLabel={Translations.t.general.share}
  >
    <slot name="content">
      <Share class="h-7 w-7 p-1" />
    </slot>
  </button>
{:else}
  <button on:click={share}>
    <Share class="h-8 w-8 pr-2" />
    {text}
  </button>
{/if}
