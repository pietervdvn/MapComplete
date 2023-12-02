<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import FavouriteSummary from "./FavouriteSummary.svelte";

  /**
   * A panel showing all your favourites
   */
  export let state: SpecialVisualizationState;
  let favourites = state.favourites.allFavourites;
</script>

<div class="flex flex-col">
  You marked {$favourites.length} locations as a favourite location.

  This list is only visible to you
  {#each $favourites as feature (feature.properties.id)}
    <FavouriteSummary {feature} {state} />
  {/each}
</div>
