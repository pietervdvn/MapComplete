<script lang="ts">
  import Loading from "./Loading.svelte";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import type { OsmServiceState } from "../../Logic/Osm/OsmConnection";
  import { Translation } from "../i18n/Translation";
  import Translations from "../i18n/Translations";
  import Tr from "./Tr.svelte";

  export let state: SpecialVisualizationState;
  /**
   * If set, 'loading' will act as if we are already logged in.
   */
  export let ignoreLoading: boolean = false
  let loadingStatus = state.osmConnection.loadingStatus;
  let badge = state.featureSwitches.featureSwitchUserbadge;
  const t = Translations.t.general;
  const offlineModes: Partial<Record<OsmServiceState, Translation>> = {
    offline: t.loginFailedOfflineMode,
    unreachable: t.loginFailedUnreachableMode,
    unknown: t.loginFailedUnreachableMode,
    readonly: t.loginFailedReadonlyMode
  };
  const apiState = state.osmConnection.apiIsOnline;


</script>

{#if $badge}
  {#if !ignoreLoading && $loadingStatus === "loading"}
    <slot name="loading">
      <Loading></Loading>
    </slot>
  {:else if $loadingStatus === "error"}
    <div class="flex items-center alert max-w-64">
      <img src="./assets/svg/invalid.svg" class="w-8 h-8 m-2 shrink-0">
      <Tr t={offlineModes[$apiState]} />
    </div>

  {:else if $loadingStatus === "logged-in"}
    <slot></slot>
  {:else if $loadingStatus === "not-attempted"}
    <slot name="not-logged-in">
      
    </slot>
  {/if}
{/if}
