<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import LoginButton from "../Base/LoginButton.svelte"
  import SingleReview from "./SingleReview.svelte"
  import Mangrove_logo from "../../assets/svg/Mangrove_logo.svelte"

  /**
   * A panel showing all the reviews by the logged-in user
   */
  export let state: SpecialVisualizationState
  let reviews = state.userRelatedState.mangroveIdentity.getAllReviews()
  const t = Translations.t.reviews
</script>

<LoginToggle {state}>
  <div slot="not-logged-in">
    <LoginButton osmConnection={state.osmConnection}>
      <Tr t={Translations.t.favouritePoi.loginToSeeList} />
    </LoginButton>
  </div>

  {#if $reviews?.length > 0}
    <div class="flex flex-col" on:keypress={(e) => console.log("Got keypress", e)}>
      {#each $reviews as review (review.sub)}
        <SingleReview {review} showSub={true} {state} />
      {/each}
    </div>
  {:else}
    <Tr t={t.your_reviews_empty} />
  {/if}
  <a
    class="link-underline"
    href="https://github.com/pietervdvn/MapComplete/issues/1782"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Tr t={t.reviews_bug} />
  </a>
  <div class="flex justify-end">
    <Mangrove_logo class="h-12 w-12 shrink-0 p-1" />
    <Tr cls="text-sm subtle" t={t.attribution} />
  </div>
</LoginToggle>
