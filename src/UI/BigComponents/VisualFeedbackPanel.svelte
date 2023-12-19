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

  export let state: ThemeViewState
  let centerFeatures = state.closestFeatures.features

  let lastAction: UIEventSource<KeyNavigationEvent> = new UIEventSource<KeyNavigationEvent>(undefined)
  state.mapProperties.onKeyNavigationEvent((event) => {
    lastAction.setData(event)
  })
  lastAction.stabilized(750).addCallbackAndRunD(_ => lastAction.setData(undefined))
</script>
<div aria-live="assertive" class="p-1" role="alert">

  {#if $lastAction !== undefined}
    <Tr t={Translations.t.general.visualFeedback[$lastAction.key]} />
  {:else if $centerFeatures.length === 0}
    <Tr t={Translations.t.general.visualFeedback.noCloseFeatures} />
  {:else}
    <div class="pointer-events-auto">
      <Tr t={Translations.t.general.visualFeedback.closestFeaturesAre} />
      <ol class="list-none">
        {#each $centerFeatures as feat, i (feat.properties.id)}
          <li class="flex">
            
            <Summary {state} feature={feat} {i}/>
          </li>
        {/each}
      </ol>
    </div>
  {/if}
</div>
