<script lang="ts">
  import { Review } from "mangrove-reviews-typescript"
  import { Store } from "../../Logic/UIEventSource"
  import StarsBar from "./StarsBar.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let review: Review & { madeByLoggedInUser: Store<boolean> }
  let name = review.metadata.nickname
  name ??= (review.metadata.given_name ?? "") + " " + (review.metadata.family_name ?? "").trim()
  if (name.length === 0) {
    name = "Anonymous"
  }
  let d = new Date()
  d.setTime(review.iat * 1000)
  let date = d.toDateString()
  let byLoggedInUser = review.madeByLoggedInUser
</script>

<div class={"low-interaction rounded-lg p-1 px-2 " + ($byLoggedInUser ? "border-interactive" : "")}>
  <div class="flex items-center justify-between">
    <StarsBar score={review.rating} />
    <div class="flex flex-wrap space-x-2">
      <div class="font-bold">
        {name}
      </div>
      <span class="subtle">
        {date}
      </span>
    </div>
  </div>
  {#if review.opinion}
    {review.opinion}
  {/if}
  {#if review.metadata.is_affiliated}
    <Tr t={Translations.t.reviews.affiliated_reviewer_warning} />
  {/if}
</div>
