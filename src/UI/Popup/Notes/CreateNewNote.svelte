<script lang="ts">
  /**
   * UIcomponent to create a new note at the given location
   */
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import { LocalStorageSource } from "../../../Logic/Web/LocalStorageSource"
  import ValidatedInput from "../../InputElement/ValidatedInput.svelte"
  import SubtleButton from "../../Base/SubtleButton.svelte"
  import Tr from "../../Base/Tr.svelte"
  import Translations from "../../i18n/Translations.js"
  import type { Feature, Point } from "geojson"
  import LoginToggle from "../../Base/LoginToggle.svelte"
  import FilteredLayer from "../../../Models/FilteredLayer"
  import NewPointLocationInput from "../../BigComponents/NewPointLocationInput.svelte"
  import Layers from "../../../assets/svg/Layers.svelte"
  import AddSmall from "../../../assets/svg/AddSmall.svelte"
  import type { OsmTags } from "../../../Models/OsmFeature"
  import Loading from "../../Base/Loading.svelte"
  import NextButton from "../../Base/NextButton.svelte"
  import Note from "../../../assets/svg/Note.svelte"
  import TitledPanel from "../../Base/TitledPanel.svelte"

  export let coordinate: UIEventSource<{ lon: number; lat: number }>
  export let state: SpecialVisualizationState

  let comment: UIEventSource<string> = LocalStorageSource.Get("note-text")
  let created = false

  let notelayer: FilteredLayer = state.layerState.filteredLayers.get("note")

  let hasFilter = notelayer?.hasFilter
  let isDisplayed = notelayer?.isDisplayed

  let submitted = false
  let textEntered = false

  function enableNoteLayer() {
    state.guistate.closeAll()
    isDisplayed.setData(true)
  }

  async function uploadNote() {
    submitted = true
    let txt = comment.data
    if (txt === undefined || txt === "") {
      return
    }
    const loc = coordinate.data
    txt += "\n\n #MapComplete #" + state?.layout?.id
    const id = await state?.osmConnection?.openNote(loc.lat, loc.lon, txt)
    console.log("Created a note, got id", id)
    const feature = <Feature<Point, OsmTags>>{
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [loc.lon, loc.lat],
      },
      properties: {
        id: "" + id.id,
        date_created: new Date().toISOString(),
        _first_comment: txt,
        comments: JSON.stringify([
          {
            text: txt,
            html: txt,
            user: state.osmConnection?.userDetails?.data?.name,
            uid: state.osmConnection?.userDetails?.data?.uid,
          },
        ]),
      },
    }
    // Normally, the 'Changes' will generate the new element. The 'notes' are an exception to this
    state.newFeatures.features.data.push(feature)
    state.newFeatures.features.ping()
    state.selectedElement?.setData(feature)
    if (state.featureProperties.trackFeature) {
      state.featureProperties.trackFeature(feature)
    }
    comment.setData("")
    created = true
    state.selectedElement.setData(feature)
  }
</script>

{#if notelayer === undefined}
  <div class="alert">
    This theme does not include the layer 'note'. As a result, no nodes can be created
  </div>
{:else if submitted}
  <Loading />
{:else if created}
  <div class="thanks">
    <Tr t={Translations.t.notes.isCreated} />
  </div>
{:else}
  <TitledPanel>

    <Tr slot="title" t={Translations.t.notes.createNoteTitle} />

    {#if !$isDisplayed}
      <div class="alert">
        <Tr t={Translations.t.notes.noteLayerNotEnabled} />
      </div>
      <SubtleButton on:click={enableNoteLayer}>
        <Layers slot="image" class="mr-4 h-8 w-8" />
        <Tr slot="message" t={Translations.t.notes.noteLayerDoEnable} />
      </SubtleButton>
    {:else if $hasFilter}
        <!-- ...but a filter is set ...-->
        <div class="alert">
          <Tr t={Translations.t.notes.noteLayerHasFilters} />
        </div>
        <SubtleButton on:click={() => notelayer.disableAllFilters()}>
          <Layers class="mr-4 h-8 w-8" />
          <Tr slot="message" t={Translations.t.notes.disableAllNoteFilters} />
        </SubtleButton>
    {:else}
      <!-- The layer with notes is displayed without filters, so we can add a note without worrying for duplicates -->
      <div class="h-full flex flex-col justify-between">

      <form
        class="flex flex-col rounded-sm p-2"
        on:submit|preventDefault={uploadNote}
      >
        <label class="neutral-label">
          <Tr t={Translations.t.notes.createNoteIntro} />
          <div class="w-full p-1">
            <ValidatedInput autofocus={true} type="text" value={comment} />
          </div>
        </label>

        <LoginToggle {state}>
          <span slot="loading"><!--empty: don't show a loading message--></span>
          <div slot="not-logged-in" class="alert">
            <Tr t={Translations.t.notes.warnAnonymous} />
          </div>
        </LoginToggle>

        {#if $comment?.length >= 3}
          <NextButton on:click={uploadNote} clss="self-end primary">
            <AddSmall slot="image" class="mr-4 h-8 w-8" />
            <Tr t={Translations.t.notes.createNote} />
          </NextButton>
        {:else}
          <div class="alert">
            <Tr t={Translations.t.notes.textNeeded} />
          </div>
        {/if}
      </form>

      <div class="h-56 w-full">
        <NewPointLocationInput value={coordinate} {state}>
          <div class="h-20 w-full pb-10" slot="image">
            <Note class="h-10 w-full" />
          </div>
        </NewPointLocationInput>
      </div>
      </div>

    {/if}
  </TitledPanel>
{/if}
