<script lang="ts">
  import ThemeViewState from "../../Models/ThemeViewState"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import Loading from "../Base/Loading.svelte"

  export let state: ThemeViewState
  /**
   * Gives the contributor some feedback based on the current state:
   * - is data loading?
   * - Is all data hidden due to filters?
   * - Is no data in view?
   */

  let dataIsLoading = state.dataIsLoading
  let currentState = state.hasDataInView
  const t = Translations.t.centerMessage
  const showingSearch = state.searchState.showSearchDrawer
</script>

{#if $currentState === "has-visible-features" || $showingSearch}
  <!-- don't show anything -->
{:else if $currentState === "zoom-to-low"}
  <div class="alert w-fit p-4">
    <Tr t={t.zoomIn} />
  </div>
{:else if $currentState === "all-filtered-away"}
  <div class="alert w-fit p-4">
    <Tr t={t.allFilteredAway} />
  </div>
{:else if $dataIsLoading}
  <div class="alert w-fit p-4">
    <Loading>
      <Tr t={Translations.t.centerMessage.loadingData} />
    </Loading>
  </div>
{:else if $currentState === "no-data"}
  <div class="alert w-fit p-4">
    <Tr t={t.noData} />
  </div>
{/if}
