<script lang="ts">
  /**
   * This component ties together all the steps that are needed to create a new point.
   * There are many subcomponents which help with that
   */
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import PresetList from "./PresetList.svelte"
  import type PresetConfig from "../../../Models/ThemeConfig/PresetConfig"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import Tr from "../../Base/Tr.svelte"
  import SubtleButton from "../../Base/SubtleButton.svelte"
  import Translations from "../../i18n/Translations.js"
  import TagHint from "../TagHint.svelte"
  import { And } from "../../../Logic/Tags/And.js"
  import LoginToggle from "../../Base/LoginToggle.svelte"
  import Constants from "../../../Models/Constants.js"
  import FilteredLayer from "../../../Models/FilteredLayer"
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import { EyeIcon, EyeOffIcon } from "@rgossiaux/svelte-heroicons/solid"
  import LoginButton from "../../Base/LoginButton.svelte"
  import NewPointLocationInput from "../../BigComponents/NewPointLocationInput.svelte"
  import CreateNewNodeAction from "../../../Logic/Osm/Actions/CreateNewNodeAction"
  import { OsmWay } from "../../../Logic/Osm/OsmObject"
  import { Tag } from "../../../Logic/Tags/Tag"
  import type { WayId } from "../../../Models/OsmFeature"
  import Loading from "../../Base/Loading.svelte"
  import type { GlobalFilter } from "../../../Models/GlobalFilter"
  import { onDestroy } from "svelte"
  import NextButton from "../../Base/NextButton.svelte"
  import BackButton from "../../Base/BackButton.svelte"
  import OpenBackgroundSelectorButton from "../../BigComponents/OpenBackgroundSelectorButton.svelte"
  import { twJoin } from "tailwind-merge"
  import Confirm from "../../../assets/svg/Confirm.svelte"
  import Close from "../../../assets/svg/Close.svelte"
  import Layers from "../../../assets/svg/Layers.svelte"
  import { Translation } from "../../i18n/Translation"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import BaseUIElement from "../../BaseUIElement"

  export let coordinate: { lon: number; lat: number }
  export let state: SpecialVisualizationState

  let selectedPreset: {
    preset: PresetConfig
    layer: LayerConfig
    icon: BaseUIElement
    tags: Record<string, string>
    text: Translation
  } = undefined
  let checkedOfGlobalFilters: number = 0
  let confirmedCategory = false
  $: if (selectedPreset === undefined) {
    confirmedCategory = false
    creating = false
    checkedOfGlobalFilters = 0
  }

  let flayer: FilteredLayer = undefined
  let layerIsDisplayed: UIEventSource<boolean> | undefined = undefined
  let layerHasFilters: Store<boolean> | undefined = undefined
  let globalFilter: UIEventSource<GlobalFilter[]> = state.layerState.globalFilters
  let _globalFilter: GlobalFilter[] = []
  onDestroy(
    globalFilter.addCallbackAndRun((globalFilter) => {
      console.log("Global filters are", globalFilter)
      _globalFilter = globalFilter ?? []
    })
  )
  $: {
    flayer = state.layerState.filteredLayers.get(selectedPreset?.layer?.id)
    layerIsDisplayed = flayer?.isDisplayed
    layerHasFilters = flayer?.hasFilter
  }
  const t = Translations.t.general.add

  const zoom = state.mapProperties.zoom

  const isLoading = state.dataIsLoading
  let preciseCoordinate: UIEventSource<{ lon: number; lat: number }> = new UIEventSource(undefined)
  let snappedToObject: UIEventSource<string> = new UIEventSource<string>(undefined)

  // Small helper variable: if the map is tapped, we should let the 'Next'-button grab some attention as users have to click _that_ to continue, not the map
  let preciseInputIsTapped = false

  let creating = false

  /**
   * Call when the user should restart the flow by clicking on the map, e.g. because they disabled filters.
   * Will delete the lastclick-location
   */
  function abort() {
    state.selectedElement.setData(undefined)
    // When aborted, we force the contributors to place the pin _again_
    // This is because there might be a nearby object that was disabled; this forces them to re-evaluate the map
    preciseInputIsTapped = false
  }

  async function confirm() {
    creating = true
    const location: { lon: number; lat: number } = preciseCoordinate.data
    const snapTo: WayId | undefined = <WayId>snappedToObject.data
    const tags: Tag[] = selectedPreset.preset.tags.concat(
      ..._globalFilter.map((f) => f?.onNewPoint?.tags ?? [])
    )
    console.log("Creating new point at", location, "snapped to", snapTo, "with tags", tags)

    let snapToWay: undefined | OsmWay = undefined
    if (snapTo !== undefined && snapTo !== null) {
      const downloaded = await state.osmObjectDownloader.DownloadObjectAsync(snapTo, 0)
      if (downloaded !== "deleted") {
        snapToWay = downloaded
      }
    }

    const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
      theme: state.layout?.id ?? "unkown",
      changeType: "create",
      snapOnto: snapToWay,
      reusePointWithinMeters: 1,
    })
    await state.changes.applyAction(newElementAction)
    state.newFeatures.features.ping()
    // The 'changes' should have created a new point, which added this into the 'featureProperties'
    const newId = newElementAction.newElementId
    console.log("Applied pending changes, fetching store for", newId)
    const tagsStore = state.featureProperties.getStore(newId)
    if (!tagsStore) {
      console.error("Bug: no tagsStore found for", newId)
    }
    {
      // Set some metainfo
      const properties = tagsStore.data
      if (snapTo) {
        // metatags (starting with underscore) are not uploaded, so we can safely mark this
        delete properties["_referencing_ways"]
        properties["_referencing_ways"] = `["${snapTo}"]`
      }
      properties["_backend"] = state.osmConnection.Backend()
      properties["_last_edit:timestamp"] = new Date().toISOString()
      const userdetails = state.osmConnection.userDetails.data
      properties["_last_edit:contributor"] = userdetails.name
      properties["_last_edit:uid"] = "" + userdetails.uid
      tagsStore.ping()
    }
    const feature = state.indexedFeatures.featuresById.data.get(newId)
    console.log("Selecting feature", feature, "and opening their popup")
    abort()
    state.selectedElement.setData(feature)
    tagsStore.ping()
    state.mapProperties.location.setData(location)
  }

  function confirmSync() {
    confirm()
      .then((_) => console.debug("New point successfully handled"))
      .catch((e) => console.error("Handling the new point went wrong due to", e))
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  <!-- This component is basically one big if/then/else flow checking for many conditions and edge cases that (in some cases) have to be handled;
      1. the first (and outermost) is of course: are we logged in?
      2. What do we want to add?
      3. Are all elements of this category visible? (i.e. there are no filters possibly hiding this, is the data still loading, ...) -->
  <LoginButton osmConnection={state.osmConnection} slot="not-logged-in">
    <Tr t={Translations.t.general.add.pleaseLogin} />
  </LoginButton>
  <div class="h-full w-full">
    {#if $zoom < Constants.minZoomLevelToAddNewPoint}
      <div class="alert">
        <Tr t={Translations.t.general.add.zoomInFurther} />
      </div>
    {:else if $isLoading}
      <div class="alert">
        <Loading>
          <Tr t={Translations.t.general.add.stillLoading} />
        </Loading>
      </div>
    {:else if selectedPreset === undefined}
      <!-- First, select the correct preset -->
      <PresetList
        {state}
        on:select={(event) => {
          selectedPreset = event.detail
        }}
      />
    {:else if !$layerIsDisplayed}
      <!-- Check that the layer is enabled, so that we don't add a duplicate -->
      <div class="alert flex items-center justify-center">
        <EyeOffIcon class="w-8" />
        <Tr
          t={Translations.t.general.add.layerNotEnabled.Subs({ layer: selectedPreset.layer.name })}
        />
      </div>

      <div class="flex flex-wrap-reverse md:flex-nowrap">
        <button
          class="flex w-full gap-x-1"
          on:click={() => {
            abort()
            state.guistate.openFilterView(selectedPreset.layer)
          }}
        >
          <Layers class="w-12" />
          <Tr t={Translations.t.general.add.openLayerControl} />
        </button>

        <button
          class="primary flex w-full gap-x-1"
          on:click={() => {
            layerIsDisplayed.setData(true)
            abort()
          }}
        >
          <EyeIcon class="w-12" />
          <Tr
            t={Translations.t.general.add.enableLayer.Subs({ name: selectedPreset.layer.name })}
          />
        </button>
      </div>
    {:else if $layerHasFilters}
      <!-- Some filters are enabled. The feature to add might already be mapped, but hidden -->
      <div class="alert flex items-center justify-center">
        <EyeOffIcon class="w-8" />
        <Tr t={Translations.t.general.add.disableFiltersExplanation} />
      </div>
      <div class="flex flex-wrap-reverse md:flex-nowrap">
        <button
          class="primary flex w-full gap-x-1"
          on:click={() => {
            abort()
            state.layerState.filteredLayers.get(selectedPreset.layer.id).disableAllFilters()
          }}
        >
          <EyeOffIcon class="w-12" />
          <Tr t={Translations.t.general.add.disableFilters} />
        </button>
        <button
          class="flex w-full gap-x-1"
          on:click={() => {
            abort()
            state.guistate.openFilterView(selectedPreset.layer)
          }}
        >
          <Layers class="w-12" />
          <Tr t={Translations.t.general.add.openLayerControl} />
        </button>
      </div>
    {:else if !confirmedCategory}
      <!-- Second, confirm the category -->
      <h2 class="mr-12">
        <Tr
          t={Translations.t.general.add.confirmTitle.Subs({ title: selectedPreset.preset.title })}
        />
      </h2>

      {#if selectedPreset.preset.description}
        <Tr t={selectedPreset.preset.description} />
      {/if}

      {#if selectedPreset.preset.exampleImages}
        <h3>
          {#if selectedPreset.preset.exampleImages.length === 1}
            <Tr t={Translations.t.general.example} />
          {:else}
            <Tr t={Translations.t.general.examples} />
          {/if}
        </h3>
        <span class="flex flex-wrap items-stretch">
          {#each selectedPreset.preset.exampleImages as src}
            <img {src} class="m-1 h-64 w-auto rounded-lg" />
          {/each}
        </span>
      {/if}
      <TagHint
        embedIn={(tags) => t.presetInfo.Subs({ tags })}
        {state}
        tags={new And(selectedPreset.preset.tags)}
      />

      <div class="flex w-full flex-wrap-reverse md:flex-nowrap">
        <BackButton on:click={() => (selectedPreset = undefined)} clss="w-full">
          <Tr t={t.backToSelect} />
        </BackButton>

        <NextButton on:click={() => (confirmedCategory = true)} clss="primary w-full">
          <div slot="image" class="relative">
            <ToSvelte construct={selectedPreset.icon} />
            <Confirm class="absolute bottom-0 right-0 h-4 w-4" />
          </div>
          <div class="w-full">
            <Tr t={selectedPreset.text} />
          </div>
        </NextButton>
      </div>
    {:else if _globalFilter?.length > 0 && _globalFilter?.length > checkedOfGlobalFilters}
      <Tr t={_globalFilter[checkedOfGlobalFilters].onNewPoint?.safetyCheck} cls="mx-12" />
      <SubtleButton
        on:click={() => {
          checkedOfGlobalFilters = checkedOfGlobalFilters + 1
        }}
      >
        <Confirm slot="image" class="h-12 w-12" />
        <Tr
          slot="message"
          t={_globalFilter[checkedOfGlobalFilters].onNewPoint?.confirmAddNew.Subs({
            preset: selectedPreset.text,
          })}
        />
      </SubtleButton>
      <SubtleButton
        on:click={() => {
          globalFilter.setData([])
          abort()
        }}
      >
        <Close slot="image" class="h-8 w-8" />
        <Tr slot="message" t={Translations.t.general.cancel} />
      </SubtleButton>
    {:else if !creating}
      <div class="flex h-full flex-col">
        <div class="min-h-20 relative h-full w-full p-1">
          <div class="h-full w-full overflow-hidden rounded-xl">
            <NewPointLocationInput
              on:click={() => {
                preciseInputIsTapped = true
              }}
              value={preciseCoordinate}
              snappedTo={snappedToObject}
              {state}
              {coordinate}
              targetLayer={selectedPreset.layer}
              presetProperties={selectedPreset.preset.tags}
              snapToLayers={selectedPreset.preset.preciseInput.snapToLayers}
            />
          </div>

          <div
            class={twJoin(
              !preciseInputIsTapped && "hidden",
              "absolute top-0 flex w-full justify-center p-12"
            )}
          >
            <!-- This is an _extra_ button that appears when the map is tapped - see usertest 2023-01-07 -->
            <NextButton on:click={confirmSync} clss="primary w-fit">
              <div class="flex w-full justify-end gap-x-2">
                <Tr t={Translations.t.general.add.confirmLocation} />
              </div>
            </NextButton>
          </div>

          <div class="absolute bottom-0 left-0 p-4">
            <OpenBackgroundSelectorButton {state} />
          </div>
        </div>
        <div class="flex flex-wrap-reverse md:flex-nowrap">
          <BackButton on:click={() => (selectedPreset = undefined)} clss="w-full">
            <Tr t={t.backToSelect} />
          </BackButton>

          <NextButton on:click={confirm} clss={"primary w-full"}>
            <div class="flex w-full justify-end gap-x-2">
              <Tr t={Translations.t.general.add.confirmLocation} />
            </div>
          </NextButton>
        </div>
      </div>
    {:else}
      <Loading><Tr t={Translations.t.general.add.creating} /></Loading>
    {/if}
  </div>
</LoginToggle>
