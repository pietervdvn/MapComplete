<script lang="ts">

  import { UIEventSource } from "../../Logic/UIEventSource";
  import type { MoveReason } from "./MoveWizardState";
  import { MoveWizardState } from "./MoveWizardState";

  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import Tr from "../Base/Tr.svelte";
  import Translations from "../i18n/Translations";
  import Move from "../../assets/svg/Move.svelte";
  import Move_not_allowed from "../../assets/svg/Move_not_allowed.svelte";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid";
  import type { MapProperties } from "../../Models/MapProperties";
  import type { Feature, Point } from "geojson";
  import { GeoOperations } from "../../Logic/GeoOperations";
  import LocationInput from "../InputElement/Helpers/LocationInput.svelte";
  import OpenBackgroundSelectorButton from "../BigComponents/OpenBackgroundSelectorButton.svelte";
  import Geosearch from "../BigComponents/Geosearch.svelte";
  import Move_confirm from "../../assets/svg/Move_confirm.svelte";
  import If from "../Base/If.svelte";
  import Constants from "../../Models/Constants";


  export let state: SpecialVisualizationState;

  export let layer: LayerConfig;
  export let featureToMove: Feature<Point>;

  let id: string = featureToMove.properties.id;
  let currentStep: "start" | "reason" | "pick_location" | "moved" = "start";
  const t = Translations.t.move;
  const reason = new UIEventSource<MoveReason>(undefined);
  let [lon, lat] = GeoOperations.centerpointCoordinates(featureToMove);

  let newLocation = new UIEventSource<{ lon: number; lat: number }>(undefined);

  function initMapProperties() {
    return <any>{
      allowMoving: new UIEventSource(true),
      allowRotating: new UIEventSource(false),
      allowZooming: new UIEventSource(true),
      bounds: new UIEventSource(undefined),
      location: new UIEventSource({ lon, lat }),
      minzoom: new UIEventSource($reason.minZoom),
      rasterLayer: state.mapProperties.rasterLayer,
      zoom: new UIEventSource($reason?.startZoom ?? 16)
    };
  }


  let moveWizardState = new MoveWizardState(id, layer.allowMove, state);
  let notAllowed = moveWizardState.moveDisallowedReason;
  let currentMapProperties: MapProperties = undefined;
</script>
{#if moveWizardState.reasons.length > 0}

  {#if $notAllowed}
    <div class="flex m-2 p-2 rounded-lg bg-gray-200">
      <Move_not_allowed class="h-8 w-8 m-2" />
      <div class="flex flex-col">
        <Tr t={t.cannotBeMoved} />
        <Tr t={$notAllowed} />
      </div>
    </div>
  {:else if currentStep === "start"}
    {#if moveWizardState.reasons.length === 1}
      <button class="flex" on:click={() => {reason.setData(moveWizardState.reasons[0]); currentStep = "pick_location"}}>
        <ToSvelte construct={moveWizardState.reasons[0].icon.SetStyle("height: 1.5rem; width: 1.5rem;")}></ToSvelte>
        <Tr t={Translations.T(moveWizardState.reasons[0].invitingText)} />
      </button>
    {:else}
      <button class="flex" on:click={() => {currentStep = "reason"}}>
        <Move class="w-6 h-6" />
        <Tr t={t.inviteToMove.generic} />
      </button>
    {/if}
  {:else if currentStep === "reason"}
    <div class="flex flex-col interactive border-interactive p-2">

      <Tr cls="text-lg font-bold" t={t.whyMove} />
      {#each moveWizardState.reasons as reasonSpec}
        <button on:click={() => {reason.setData(reasonSpec); currentStep = "pick_location"}}>
          <ToSvelte  construct={reasonSpec.icon.SetClass("w-16 h-16 pr-2")} />
          <Tr t={reasonSpec.text} />
        </button>
      {/each}
    </div>

  {:else if currentStep === "pick_location"}
    <div class="flex flex-col border-interactive interactive p-2">
      <Tr cls="text-lg font-bold" t={t.moveTitle} />


      <div class="relative w-full h-64">
        <LocationInput mapProperties={currentMapProperties = initMapProperties()} value={newLocation}
                       initialCoordinate={{lon, lat}} />
        <div class="absolute bottom-0 left-0">
          <OpenBackgroundSelectorButton {state} />
        </div>
      </div>

      {#if $reason.includeSearch}
        <Geosearch bounds={ currentMapProperties.bounds} clearAfterView={false} />
      {/if}


      <div class="flex flex-wrap">
        <If condition={currentMapProperties.zoom.mapD(zoom => zoom >= Constants.minZoomLevelToAddNewPoint)}>

          <button class="flex flex primary w-full"
                  on:click={() => {moveWizardState.moveFeature(newLocation.data, reason.data, featureToMove)}}>
            <Move class="w-6 h-6 mr-2" />
            <Tr t={t.confirmMove} />
          </button>

          <div slot="else" class="alert">
            <Tr t={t.zoomInFurther} />
          </div>

        </If>

        <button class="w-full" on:click={() => {currentStep= "start"}}>
          <XCircleIcon class="w-6 h-6 mr-2" />
          <Tr t={t.cancel} />
        </button>

      </div>
    </div>


  {:else if currentStep === "moved"}

    <div class="flex flex-col">
      <Tr cls="thanks" t={t.pointIsMoved} />
      <button on:click={() => {currentStep = "reason"}}>
        <Move />
        <Tr t={t.inviteToMoveAgain} />
      </button>
    </div>

  {/if}
{/if}
