<script lang="ts">
  import FeatureReviews from "../../Logic/Web/MangroveReviews"
  import StarsBar from "./StarsBar.svelte"
  import SpecialTranslation from "../Popup/TagRendering/SpecialTranslation.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Translations from "../i18n/Translations"
  import Checkbox from "../Base/Checkbox.svelte"
  import Tr from "../Base/Tr.svelte"
  import If from "../Base/If.svelte"
  import Loading from "../Base/Loading.svelte"
  import { Review } from "mangrove-reviews-typescript"
  import { Utils } from "../../Utils"
  import { placeholder } from "../../Utils/placeholder"

  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  export let feature: Feature
  export let layer: LayerConfig
  /**
   * The form to create a new review.
   * This is multi-stepped.
   */
  export let reviews: FeatureReviews

  let score = 0
  let confirmedScore = undefined
  let isAffiliated = new UIEventSource(false)
  let opinion = new UIEventSource<string>(undefined)

  const t = Translations.t.reviews

  let _state: "ask" | "saving" | "done" = "ask"

  const connection = state.osmConnection

  async function save() {
    _state = "saving"
    let nickname = undefined
    if (connection.isLoggedIn.data) {
      nickname = connection.userDetails.data.name
    }
    const review: Omit<Review, "sub"> = {
      rating: confirmedScore,
      opinion: opinion.data,
      metadata: { nickname, is_affiliated: isAffiliated.data },
    }
    if (state.featureSwitchIsTesting?.data ?? true) {
      console.log("Testing - not actually saving review", review)
      await Utils.waitFor(1000)
    } else {
      await reviews.createReview(review)
    }
    _state = "done"
  }
</script>

{#if _state === "done"}
  <Tr cls="thanks w-full" t={t.saved} />
{:else if _state === "saving"}
  <Loading>
    <Tr t={t.saving_review} />
  </Loading>
{:else}
  <div class="interactive border-interactive p-1">
    <div class="font-bold">
      <SpecialTranslation {feature} {layer} {state} t={Translations.t.reviews.question} {tags} />
    </div>
    <StarsBar
      on:click={(e) => {
        confirmedScore = e.detail.score
      }}
      on:hover={(e) => {
        score = e.detail.score
      }}
      on:mouseout={(e) => {
        score = null
      }}
      score={score ?? confirmedScore ?? 0}
      starSize="w-8 h-8"
    />

    {#if confirmedScore !== undefined}
      <Tr cls="font-bold mt-2" t={t.question_opinion} />
      <textarea autofocus bind:value={$opinion} inputmode="text" rows="3" class="mb-1 w-full" 
      use:placeholder={t.reviewPlaceholder}/>
      <Checkbox selected={isAffiliated}>
        <div class="flex flex-col">
          <Tr t={t.i_am_affiliated} />
          <Tr cls="subtle" t={t.i_am_affiliated_explanation} />
        </div>
      </Checkbox>
      <div class="flex w-full flex-wrap items-center justify-between">
        <If condition={state.osmConnection.isLoggedIn}>
          <Tr t={t.reviewing_as.Subs({ nickname: state.osmConnection.userDetails.data.name })} />
          <Tr slot="else" t={t.reviewing_as_anonymous} />
        </If>
        <button class="primary" on:click={save}>
          <Tr t={t.save} />
        </button>
      </div>

      <Tr cls="subtle mt-4" t={t.tos} />
    {/if}
  </div>
{/if}
