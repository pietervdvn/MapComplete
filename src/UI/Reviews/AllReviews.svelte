<script lang="ts">
  import FeatureReviews from "../../Logic/Web/MangroveReviews"
  import SingleReview from "./SingleReview.svelte"
  import { Utils } from "../../Utils"
  import StarsBar from "./StarsBar.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import ReviewPrivacyShield from "./ReviewPrivacyShield.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"

  /**
   * An element showing all reviews
   */
  export let reviews: FeatureReviews
  export let state: ThemeViewState

  let average = reviews.average
  let _reviews = []
  reviews.reviews.addCallbackAndRunD((r) => {
    _reviews = Utils.NoNull(r)
  })
</script>

<ReviewPrivacyShield {reviews} guistate={state.guistate}>
  <div class="border-2 border-dashed border-gray-300 p-2">
    {#if _reviews.length > 1}
      <StarsBar score={$average} />
    {/if}
    {#if _reviews.length > 0}
      {#each _reviews as review}
        <SingleReview {review} />
      {/each}
    {:else}
      <div class="subtle m-2 italic">
        <Tr t={Translations.t.reviews.no_reviews_yet} />
      </div>
    {/if}
    <div class="flex justify-end">
      <Tr cls="text-sm subtle" t={Translations.t.reviews.attribution} />
    </div>
  </div>
</ReviewPrivacyShield>
