<script lang="ts">
  /**
   * This component ties together all the steps that are needed to create a new point.
   * There are many subcomponents which help with that
   */
  import type { SpecialVisualizationState } from "../../SpecialVisualization";
  import PresetList from "./PresetList.svelte";
  import type PresetConfig from "../../../Models/ThemeConfig/PresetConfig";
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
  import Tr from "../../Base/Tr.svelte";
  import SubtleButton from "../../Base/SubtleButton.svelte";
  import FromHtml from "../../Base/FromHtml.svelte";
  import Translations from "../../i18n/Translations.js";
  import TagHint from "../TagHint.svelte";
  import { And } from "../../../Logic/Tags/And.js";
  import LoginToggle from "../../Base/LoginToggle.svelte";
  import Constants from "../../../Models/Constants.js";
  import FilteredLayer from "../../../Models/FilteredLayer";
  import { Store, UIEventSource } from "../../../Logic/UIEventSource";
  import { EyeIcon, EyeOffIcon } from "@rgossiaux/svelte-heroicons/solid";
  import LoginButton from "../../Base/LoginButton.svelte";
  import NewPointLocationInput from "../../BigComponents/NewPointLocationInput.svelte";
  import CreateNewNodeAction from "../../../Logic/Osm/Actions/CreateNewNodeAction";
  import { OsmObject } from "../../../Logic/Osm/OsmObject";
  import { Tag } from "../../../Logic/Tags/Tag";
  import type { WayId } from "../../../Models/OsmFeature";
  import { TagUtils } from "../../../Logic/Tags/TagUtils";
  import Loading from "../../Base/Loading.svelte";

  export let coordinate: { lon: number, lat: number };
  export let state: SpecialVisualizationState;

  let selectedPreset: { preset: PresetConfig, layer: LayerConfig, icon: string, tags: Record<string, string> } = undefined;

  let confirmedCategory = false;
  $: if (selectedPreset === undefined) {
    confirmedCategory = false;
    creating = false;
  }

  let flayer: FilteredLayer = undefined;
  let layerIsDisplayed: UIEventSource<boolean> | undefined = undefined;
  let layerHasFilters: Store<boolean> | undefined = undefined;

  $:{
    flayer = state.layerState.filteredLayers.get(selectedPreset?.layer?.id);
    layerIsDisplayed = flayer?.isDisplayed;
    layerHasFilters = flayer?.hasFilter;
  }
  const t = Translations.t.general.add;

  const zoom = state.mapProperties.zoom;

  const isLoading = state.dataIsLoading;
  let preciseCoordinate: UIEventSource<{ lon: number, lat: number }> = new UIEventSource(undefined);
  let snappedToObject: UIEventSource<string> = new UIEventSource<string>(undefined);

  let creating = false;

  /**
   * Call when the user should restart the flow by clicking on the map, e.g. because they disabled filters.
   * Will delete the lastclick-location
   */
  function abort() {
    state.selectedElement.setData(undefined);
    // When aborted, we force the contributors to place the pin _again_
    // This is because there might be a nearby object that was disabled; this forces them to re-evaluate the map
    state.lastClickObject.features.setData([]);
  }

  async function confirm() {
    creating = true;
    const location: { lon: number; lat: number } = preciseCoordinate.data;
    const snapTo: WayId | undefined = <WayId>snappedToObject.data;
    const tags: Tag[] = selectedPreset.preset.tags;
    console.log("Creating new point at", location, "snapped to", snapTo, "with tags", tags);

    const snapToWay = snapTo === undefined ? undefined : await OsmObject.DownloadObjectAsync(snapTo, 0);

    const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
      theme: state.layout?.id ?? "unkown",
      changeType: "create",
      snapOnto: snapToWay
    });
    await state.changes.applyAction(newElementAction);
    const newId = newElementAction.newElementId;
    state.newFeatures.features.data.push({
      type: "Feature",
      properties: {
        id: newId,
        ...TagUtils.KVtoProperties(tags)
      },
      geometry: {
        type: "Point",
        coordinates: [location.lon, location.lat]
      }
    });
    state.newFeatures.features.ping();
    {
      // Set some metainfo
      const tagsStore = state.featureProperties.getStore(newId);
      const properties = tagsStore.data;
      if (snapTo) {
        // metatags (starting with underscore) are not uploaded, so we can safely mark this
        properties["_referencing_ways"] = `["${snapTo}"]`;
      }
      properties["_last_edit:timestamp"] = new Date().toISOString();
      const userdetails = state.osmConnection.userDetails.data;
      properties["_last_edit:contributor"] = userdetails.name;
      properties["_last_edit:uid"] = "" + userdetails.uid;
      tagsStore.ping();
    }
    const feature = state.indexedFeatures.featuresById.data.get(newId);
    abort();
    state.selectedElement.setData(feature);
    state.selectedLayer.setData(selectedPreset.layer);

  }

</script>

<LoginToggle ignoreLoading={true} {state}>
  <LoginButton osmConnection={state.osmConnection} slot="not-logged-in">
    <Tr slot="message" t={Translations.t.general.add.pleaseLogin} />
  </LoginButton>
  {#if $isLoading}
    <div class="alert">
      <Loading>
        <Tr t={Translations.t.general.add.stillLoading} />
      </Loading>
    </div>
  {:else if $zoom < Constants.minZoomLevelToAddNewPoint}
    <div class="alert">
      <Tr t={Translations.t.general.add.zoomInFurther}></Tr>
    </div>
  {:else if selectedPreset === undefined}
    <!-- First, select the correct preset -->
    <PresetList {state} on:select={event => {selectedPreset = event.detail}}></PresetList>


  {:else if !$layerIsDisplayed}
    <!-- Check that the layer is enabled, so that we don't add a duplicate -->
    <div class="alert flex justify-center items-center">
      <EyeOffIcon class="w-8" />
      <Tr t={Translations.t.general.add.layerNotEnabled
                    .Subs({ layer: selectedPreset.layer.name })
                   } />
    </div>

    <SubtleButton on:click={() => {
      layerIsDisplayed.setData(true)
      abort()
    }}>
      <EyeIcon slot="image" class="w-8" />
      <Tr slot="message" t={Translations.t.general.add.enableLayer.Subs({name: selectedPreset.layer.name})} />
    </SubtleButton>
    <SubtleButton on:click={() => {
      abort()
      state.guistate.openFilterView(selectedPreset.layer)    }    }>
      <img src="./assets/svg/layers.svg" slot="image" class="w-6">
      <Tr slot="message" t={Translations.t.general.add.openLayerControl}></Tr>
    </SubtleButton>


  {:else if $layerHasFilters}
    <!-- Some filters are enabled. The feature to add might already be mapped, but hiddne -->
    <div class="alert flex justify-center items-center">
      <EyeOffIcon class="w-8" />
      <Tr t={Translations.t.general.add.disableFiltersExplanation} />
    </div>

    <SubtleButton on:click={() => {
      abort()
      const flayer = state.layerState.filteredLayers.get(selectedPreset.layer.id)
      flayer.disableAllFilters()
    }
    }>
      <EyeOffIcon class="w-8" />
      <Tr slot="message" t={Translations.t.general.add.disableFilters}></Tr>
    </SubtleButton>


    <SubtleButton on:click={() => {
      abort()
      state.guistate.openFilterView(selectedPreset.layer)
    }
    }>
      <img src="./assets/svg/layers.svg" slot="image" class="w-6">
      <Tr slot="message" t={Translations.t.general.add.openLayerControl}></Tr>
    </SubtleButton>

  {:else if !confirmedCategory  }
    <!-- Second, confirm the category -->
    <Tr t={Translations.t.general.add.confirmIntro.Subs({title: selectedPreset.preset.title})}></Tr>


    {#if selectedPreset.preset.description}
      <Tr t={selectedPreset.preset.description} />
    {/if}

    {#if selectedPreset.preset.exampleImages}
      <h4>
        {#if selectedPreset.preset.exampleImages.length == 1}
          <Tr t={Translations.t.general.example} />
        {:else}
          <Tr t={Translations.t.general.examples } />
        {/if}
      </h4>
      <span class="flex flex-wrap items-stretch">
      {#each selectedPreset.preset.exampleImages as src}
        <img {src} class="h-64 m-1 w-auto rounded-lg">
      {/each}
      </span>
    {/if}
    <TagHint embedIn={tags => t.presetInfo.Subs({tags})} osmConnection={state.osmConnection}
             tags={new And(selectedPreset.preset.tags)}></TagHint>


    <SubtleButton on:click={() => confirmedCategory = true}>
      <div slot="image" class="relative">
        <FromHtml src={selectedPreset.icon}></FromHtml>
        <img class="absolute bottom-0 right-0 w-4 h-4" src="./assets/svg/confirm.svg">
      </div>
      <div slot="message">
        <Tr t={selectedPreset.text}></Tr>
      </div>
    </SubtleButton>
    <SubtleButton on:click={() => selectedPreset = undefined}>
      <img src="./assets/svg/back.svg" class="w-8 h-8" slot="image">
      <div slot="message">
        <Tr t={t.backToSelect} />
      </div>
    </SubtleButton>
  {:else if !creating}
    <NewPointLocationInput value={preciseCoordinate} snappedTo={snappedToObject} {state} {coordinate}
                           targetLayer={selectedPreset.layer}
                           snapToLayers={selectedPreset.preset.preciseInput.snapToLayers}></NewPointLocationInput>
    <SubtleButton on:click={confirm}>
      <span slot="message">Confirm location</span>
    </SubtleButton>
  {:else}
    <Loading>Creating point...</Loading>
  {/if}
</LoginToggle>
