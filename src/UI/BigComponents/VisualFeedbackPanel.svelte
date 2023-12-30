<script lang="ts">
  /**
   * The visual feedback panel gives visual (and auditive) feedback on the main map view
   */

  import Translations from "../i18n/Translations"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Summary from "./Summary.svelte"
  import Tr from "../Base/Tr.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { KeyNavigationEvent } from "../../Models/MapProperties"
  import MapCenterDetails from "./MapCenterDetails.svelte"

  export let state: ThemeViewState
  const t = Translations.t.general.visualFeedback
  let map = state.mapProperties
  let centerFeatures = state.closestFeatures.features
  let translationWithLength = centerFeatures
    .mapD((cf) => cf.length)
    .mapD((n) => {
      if (n === 1) {
        return t.oneFeatureInView
      }
      return t.closestFeaturesAre.Subs({ n })
    })

  let lastAction: UIEventSource<KeyNavigationEvent> = new UIEventSource<KeyNavigationEvent>(
    undefined
  )
  state.mapProperties.onKeyNavigationEvent((event) => {
    lastAction.setData(event)
  })
  lastAction.stabilized(750).addCallbackAndRunD((_) => lastAction.setData(undefined))
</script>

<div aria-live="assertive" class="m-1 rounded bg-white p-1">
  {#if $lastAction?.key === "out"}
    <Tr t={t.out.Subs({ z: map.zoom.data - 1 })} />
  {:else if $lastAction?.key === "in"}
    <Tr t={t.out.Subs({ z: map.zoom.data + 1 })} />
  {:else if $lastAction !== undefined}
    <Tr t={t[$lastAction.key]} />
  {:else if $centerFeatures?.length === 0}
    <Tr t={t.noCloseFeatures} />
    <MapCenterDetails {state} />
  {:else if $centerFeatures !== undefined}
    <div class="pointer-events-auto">
      <Tr t={$translationWithLength} />
      <MapCenterDetails {state} />
      <div class="grid grid-cols-3 space-x-1 space-y-0.5">
        {#each $centerFeatures.slice(0, 9) as feat, i (feat.properties.id)}
          <Summary {state} feature={feat} {i} />
        {/each}
      </div>
    </div>
  {/if}
</div>
