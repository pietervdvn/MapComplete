<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { MoveReason } from "./MoveWizardState"
  import { MoveWizardState } from "./MoveWizardState"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Move from "../../assets/svg/Move.svelte"
  import Move_not_allowed from "../../assets/svg/Move_not_allowed.svelte"
  import type { MapProperties } from "../../Models/MapProperties"
  import type { Feature, Point } from "geojson"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import LocationInput from "../InputElement/Helpers/LocationInput.svelte"
  import OpenBackgroundSelectorButton from "../BigComponents/OpenBackgroundSelectorButton.svelte"
  import Geosearch from "../BigComponents/Geosearch.svelte"
  import If from "../Base/If.svelte"
  import Constants from "../../Models/Constants"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import BackButton from "../Base/BackButton.svelte"
  import ChevronLeft from "@babeard/svelte-heroicons/solid/ChevronLeft"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Icon from "../Map/Icon.svelte"

  export let state: ThemeViewState

  export let layer: LayerConfig
  export let featureToMove: Feature<Point>

  let id: string = featureToMove.properties.id
  let currentStep: "reason" | "pick_location" | "moved" = "reason"
  const t = Translations.t.move
  let reason = new UIEventSource<MoveReason>(undefined)

  let [lon, lat] = GeoOperations.centerpointCoordinates(featureToMove)

  let newLocation = new UIEventSource<{ lon: number; lat: number }>(undefined)

  function initMapProperties() {
    return <any>{
      allowMoving: new UIEventSource(true),
      allowRotating: new UIEventSource(false),
      allowZooming: new UIEventSource(true),
      bounds: new UIEventSource(undefined),
      location: new UIEventSource({ lon, lat }),
      minzoom: new UIEventSource($reason.minZoom),
      rasterLayer: state.mapProperties.rasterLayer,
      zoom: new UIEventSource($reason?.startZoom ?? 16),
    }
  }

  let moveWizardState = new MoveWizardState(id, layer.allowMove, state)
  if (moveWizardState.reasons.length === 1) {
    reason.setData(moveWizardState.reasons[0])
  }
  let notAllowed = moveWizardState.moveDisallowedReason
  let currentMapProperties: MapProperties = undefined
</script>

<LoginToggle {state}>
  {#if moveWizardState.reasons.length > 0}
    {#if $notAllowed}
      <div class="m-2 flex rounded-lg bg-gray-200 p-2">
        <Move_not_allowed class="m-2 h-8 w-8" />
        <div class="flex flex-col">
          <Tr t={t.cannotBeMoved} />
          <Tr t={$notAllowed} />
        </div>
      </div>
    {:else}
      <AccordionSingle>
        <span slot="header" class="flex">
          {#if moveWizardState.reasons.length === 1}
            <Icon icon={moveWizardState.reasons[0].icon} clss="w-6 h-6" />
            <Tr t={Translations.T(moveWizardState.reasons[0].invitingText)} />
          {:else}
            <Move class="h-6 w-6" />
            <Tr t={t.inviteToMove.generic} />
          {/if}
        </span>
        <span class="flex flex-col p-2">
          {#if currentStep === "reason" && moveWizardState.reasons.length > 1}
            {#each moveWizardState.reasons as reasonSpec}
              <button
                on:click={() => {
                  reason.setData(reasonSpec)
                  currentStep = "pick_location"
                }}
              >
                <Icon icon={reasonSpec.icon} clss="w-12 h-12" />
                <Tr t={Translations.T(reasonSpec.text)} />
              </button>
            {/each}
          {:else if currentStep === "pick_location" || currentStep === "reason"}
            <div class="relative h-64 w-full">
              <LocationInput
                mapProperties={(currentMapProperties = initMapProperties())}
                value={newLocation}
                initialCoordinate={{ lon, lat }}
              />
              <div class="absolute bottom-0 left-0">
                <OpenBackgroundSelectorButton {state} />
              </div>
            </div>

            {#if $reason.includeSearch}
              <Geosearch bounds={currentMapProperties.bounds} clearAfterView={false} />
            {/if}

            <div class="flex flex-wrap">
              <If
                condition={currentMapProperties.zoom.mapD(
                  (zoom) => zoom >= Constants.minZoomLevelToAddNewPoint
                )}
              >
                <button
                  class="primary w-full"
                  on:click={() => {
                    moveWizardState.moveFeature(newLocation.data, reason.data, featureToMove)
                    currentStep = "moved"
                  }}
                >
                  <Tr t={t.confirmMove} />
                </button>

                <div slot="else" class="alert w-full">
                  <Tr t={t.zoomInFurther} />
                </div>
              </If>
              {#if moveWizardState.reasons.length > 1}
                <button
                  class="w-full"
                  on:click={() => {
                    currentStep = "reason"
                  }}
                >
                  <ChevronLeft class="h-6 w-6" />
                  <Tr t={t.cancel} />
                </button>
              {/if}
            </div>
          {:else if currentStep === "moved"}
            <div class="flex flex-col">
              <Tr cls="thanks" t={t.pointIsMoved} />
              <button
                on:click={() => {
                  currentStep = "reason"
                }}
              >
                <Move class="h-6 w-6 pr-2" />
                <Tr t={t.inviteToMoveAgain} />
              </button>
            </div>
          {/if}
        </span>
      </AccordionSingle>
    {/if}
  {/if}
</LoginToggle>
