<script lang="ts">
  import type { ImportFlowArguments } from "./ImportFlow"
  /**
   * The 'importflow' does some basic setup, e.g. validate that imports are allowed, that the user is logged-in, ...
   * They show some default components
   */
  import ImportFlow from "./ImportFlow"
  import LoginToggle from "../../Base/LoginToggle.svelte"
  import BackButton from "../../Base/BackButton.svelte"
  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"
  import NextButton from "../../Base/NextButton.svelte"
  import { createEventDispatcher, onDestroy } from "svelte"
  import Loading from "../../Base/Loading.svelte"
  import { And } from "../../../Logic/Tags/And"
  import TagHint from "../TagHint.svelte"
  import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
  import { Store } from "../../../Logic/UIEventSource"
  import Svg from "../../../Svg"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import { EyeIcon, EyeOffIcon } from "@rgossiaux/svelte-heroicons/solid"
  import FilteredLayer from "../../../Models/FilteredLayer"
  import Confirm from "../../../assets/svg/Confirm.svelte"

  export let importFlow: ImportFlow<ImportFlowArguments>
  let state = importFlow.state

  export let currentFlowStep: "start" | "confirm" | "importing" | "imported" = "start"

  const isLoading = state.dataIsLoading
  let dispatch = createEventDispatcher<{ confirm }>()
  let canBeImported = importFlow.canBeImported()
  let tags: Store<TagsFilter> = importFlow.tagsToApply.map((tags) => new And(tags))

  let targetLayers = importFlow.targetLayer
  let filteredLayer: FilteredLayer
  let undisplayedLayer: FilteredLayer

  function updateIsDisplayed() {
    filteredLayer = targetLayers.find((tl) => tl.hasFilter.data)
    undisplayedLayer = targetLayers.find((tl) => !tl.isDisplayed.data)
  }

  updateIsDisplayed()

  for (const tl of targetLayers) {
    onDestroy(tl.isDisplayed.addCallback(updateIsDisplayed))
  }

  function abort() {
    state.selectedElement.setData(undefined)
  }
</script>

<LoginToggle {state}>
  {#if $canBeImported !== true && $canBeImported !== undefined}
    <Tr cls="alert w-full flex justify-center" t={$canBeImported.error} />
    {#if $canBeImported.extraHelp}
      <Tr t={$canBeImported.extraHelp} />
    {/if}
  {:else if undisplayedLayer !== undefined}
    <!-- Check that the layer is enabled, so that we don't add a duplicate -->
    <div class="alert flex items-center justify-center">
      <EyeOffIcon class="w-8" />
      <Tr
        t={Translations.t.general.add.layerNotEnabled.Subs({
          layer: undisplayedLayer.layerDef.name,
        })}
      />
    </div>

    <div class="flex flex-wrap-reverse md:flex-nowrap">
      <button
        class="flex w-full gap-x-1"
        on:click={() => {
          abort()
          state.guistate.openFilterView(filteredLayer.layerDef)
        }}
      >
        <ToSvelte construct={Svg.layers_svg().SetClass("w-12")} />
        <Tr t={Translations.t.general.add.openLayerControl} />
      </button>

      <button
        class="primary flex w-full gap-x-1"
        on:click={() => {
          undisplayedLayer.isDisplayed.setData(true)
          abort()
        }}
      >
        <EyeIcon class="w-12" />
        <Tr
          t={Translations.t.general.add.enableLayer.Subs({
            name: undisplayedLayer.layerDef.name,
          })}
        />
      </button>
    </div>
  {:else if filteredLayer !== undefined}
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
          filteredLayer.disableAllFilters()
        }}
      >
        <EyeOffIcon class="w-12" />
        <Tr t={Translations.t.general.add.disableFilters} />
      </button>
      <button
        class="flex w-full gap-x-1"
        on:click={() => {
          abort()
          state.guistate.openFilterView(filteredLayer.layerDef)
        }}
      >
        <ToSvelte construct={Svg.layers_svg().SetClass("w-12")} />
        <Tr t={Translations.t.general.add.openLayerControl} />
      </button>
    </div>
  {:else if $isLoading}
    <Loading>
      <Tr t={Translations.t.general.add.stillLoading} />
    </Loading>
  {:else if currentFlowStep === "start"}
    <NextButton clss="primary w-full" on:click={() => (currentFlowStep = "confirm")}>
      <slot name="start-flow-text">
        {#if importFlow?.args?.icon}
          <img class="h-8 w-8" src={importFlow.args.icon} />
        {/if}
        {importFlow.args.text}
      </slot>
    </NextButton>
  {:else if currentFlowStep === "confirm"}
    <div class="flex h-full w-full flex-col">
      <div class="h-full w-full">
        <slot name="map" />
      </div>
      <div class="flex flex-col-reverse md:flex-row">
        <BackButton clss="w-full" on:click={() => (currentFlowStep = "start")}>
          <Tr t={Translations.t.general.back} />
        </BackButton>
        <NextButton
          clss="primary w-full"
          on:click={() => {
            currentFlowStep = "imported"
            dispatch("confirm")
          }}
        >
          <span slot="image" class="h-8 w-8 pr-4">
            {#if importFlow.args.icon}
              <img src={importFlow.args.icon} />
            {:else}
              <Confirm class="h-8 w-8 pr-4" />
            {/if}
          </span>
          <slot name="confirm-text">
            {importFlow.args.text}
          </slot>
        </NextButton>
      </div>

      <div class="subtle">
        <TagHint
          embedIn={(str) => Translations.t.general.add.import.importTags.Subs({ tags: str })}
          {state}
          tags={$tags}
        />
      </div>
    </div>
  {:else if currentFlowStep === "importing"}
    <Loading />
  {:else if currentFlowStep === "imported"}
    <div class="thanks w-full p-4">
      <Tr t={Translations.t.general.add.import.hasBeenImported} />
    </div>
  {/if}
</LoginToggle>
