<script lang="ts">/**
 * Due to privacy, we cannot load reviews unless allowed in the privacy policy
 */
import FeatureReviews from "../../Logic/Web/MangroveReviews"
import { MenuState } from "../../Models/MenuState"

export let guistate: MenuState
export let reviews: FeatureReviews
export let hiddenIfNotAllowed: boolean = false
let allowed = reviews.loadingAllowed
</script>

{#if $allowed}
  <slot />
{:else if !hiddenIfNotAllowed && $allowed !== null  }
  <div class="low-interaction flex flex-col rounded mx-1">

    Reviews are disabled due to your privacy settings.
    <button on:click={() => reviews.loadingAllowed.set(true)} class="primary">
      Load reviews once
    </button>
    <button class="as-link self-end" on:click={() => guistate.openUsersettings("mangrove-reviews-allowed")}>
      Edit your privacy settings
    </button>
  </div>
{/if}

