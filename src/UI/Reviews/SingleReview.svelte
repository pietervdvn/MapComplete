<script lang="ts">
  import { Review } from "mangrove-reviews-typescript"
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"
  import StarsBar from "./StarsBar.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import type { SpecialVisualizationState } from "../SpecialVisualization"

  export let state: SpecialVisualizationState = undefined
  export let review: Review & {
    kid: string
    signature: string
    madeByLoggedInUser?: Store<boolean>
  }
  let name = review.metadata.nickname
  name ??= ((review.metadata.given_name ?? "") + " " + (review.metadata.family_name ?? "")).trim()
  let d = new Date()
  d.setTime(review.iat * 1000)
  let date = d.toDateString()
  let byLoggedInUser = review.madeByLoggedInUser ?? ImmutableStore.FALSE

  export let showSub = false
  let subUrl = new URL(review.sub)
  let [lat, lon] = subUrl.pathname.split(",").map((l) => Number(l))
  let sub = subUrl.searchParams.get("q")

  function selectFeature() {
    console.log("Selecting and zooming to", { lon, lat })
    state?.mapProperties?.location?.setData({ lon, lat })
    state?.mapProperties?.zoom?.setData(Math.max(16, state?.mapProperties?.zoom?.data))

    state?.guistate?.closeAll()
  }
</script>

<div
  class={"low-interaction flex flex-col rounded-lg p-1 px-2" +
    ($byLoggedInUser ? "border-interactive" : "")}
>
  {#if showSub}
    <button class="link" on:click={() => selectFeature()}>
      <h3>{sub}</h3>
    </button>
  {/if}
  <div class="flex w-full items-center justify-between">
    <div
      tabindex="0"
      use:ariaLabel={Translations.t.reviews.rated.Subs({
        n: "" + Math.round(review.rating / 10) / 2,
      })}
    >
      <StarsBar readonly={true} score={review.rating} />
    </div>
    <div class="flex flex-wrap space-x-2">
      <a
        href={`https://mangrove.reviews/list?kid=${encodeURIComponent(review.kid)}`}
        rel="noopener"
        target="_blank"
      >
        {#if !name}
          <i>Anonymous</i>
        {:else}
          <span class="font-bold">
            {name}
          </span>
        {/if}
      </a>
      <span class="subtle">
        {date}
      </span>
    </div>
  </div>
  {#if review.opinion}
    <div class="link-no-underline">
      <a
        target="_blank"
        rel="noopener nofollow"
        href={`https://mangrove.reviews/list?signature=${encodeURIComponent(review.signature)}`}
      >
        {review.opinion}
      </a>
    </div>
  {/if}
  {#if review.metadata.is_affiliated}
    <Tr t={Translations.t.reviews.affiliated_reviewer_warning} />
  {/if}
</div>
