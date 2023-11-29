<script lang="ts">
  import { ImmutableStore, UIEventSource } from "../../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import Tr from "../../Base/Tr.svelte"
  import type { Feature } from "geojson"
  import type { Mapping } from "../../../Models/ThemeConfig/TagRenderingConfig"
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig"
  import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
  import FreeformInput from "./FreeformInput.svelte"
  import Translations from "../../i18n/Translations.js"
  import ChangeTagAction from "../../../Logic/Osm/Actions/ChangeTagAction"
  import { createEventDispatcher, onDestroy } from "svelte"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import SpecialTranslation from "./SpecialTranslation.svelte"
  import TagHint from "../TagHint.svelte"
  import LoginToggle from "../../Base/LoginToggle.svelte"
  import SubtleButton from "../../Base/SubtleButton.svelte"
  import Loading from "../../Base/Loading.svelte"
  import TagRenderingMappingInput from "./TagRenderingMappingInput.svelte"
  import { Translation } from "../../i18n/Translation"
  import Constants from "../../../Models/Constants"
  import { Unit } from "../../../Models/Unit"
  import UserRelatedState from "../../../Logic/State/UserRelatedState"
  import { twJoin } from "tailwind-merge"
  import { TagUtils } from "../../../Logic/Tags/TagUtils"
  import Search from "../../../assets/svg/Search.svelte";
  import Login from "../../../assets/svg/Login.svelte";

  export let config: TagRenderingConfig
  export let tags: UIEventSource<Record<string, string>>
  export let selectedElement: Feature
  export let state: SpecialVisualizationState
  export let layer: LayerConfig | undefined

  let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)

  let unit: Unit = layer?.units?.find((unit) => unit.appliesToKeys.has(config.freeform?.key))

  // Will be bound if a freeform is available
  let freeformInput = new UIEventSource<string>(tags?.[config.freeform?.key])
  let selectedMapping: number = undefined
  let checkedMappings: boolean[]

  /**
   * Prepares and fills the checkedMappings
   */
  function initialize(tgs: Record<string, string>, confg: TagRenderingConfig) {
    mappings = confg.mappings?.filter((m) => {
      if (typeof m.hideInAnswer === "boolean") {
        return !m.hideInAnswer
      }
      return !m.hideInAnswer.matchesProperties(tgs)
    })
    // We received a new config -> reinit
    unit = layer?.units?.find((unit) => unit.appliesToKeys.has(config.freeform?.key))

    if (
      confg.mappings?.length > 0 &&
      confg.multiAnswer &&
      (checkedMappings === undefined ||
        checkedMappings?.length < confg.mappings.length + (confg.freeform ? 1 : 0))
    ) {
      const seenFreeforms = []
      TagUtils.FlattenMultiAnswer()
      checkedMappings = [
        ...confg.mappings.map((mapping) => {
          const matches = TagUtils.MatchesMultiAnswer(mapping.if, tgs)
          if (matches && confg.freeform) {
            const newProps = TagUtils.changeAsProperties(mapping.if.asChange())
            seenFreeforms.push(newProps[confg.freeform.key])
          }
          return matches
        }),
      ]

      if (tgs !== undefined && confg.freeform) {
        const unseenFreeformValues = tgs[confg.freeform.key]?.split(";") ?? []
        for (const seenFreeform of seenFreeforms) {
          if (!seenFreeform) {
            continue
          }
          const index = unseenFreeformValues.indexOf(seenFreeform)
          if (index < 0) {
            continue
          }
          unseenFreeformValues.splice(index, 1)
        }
        // TODO this has _to much_ values
        freeformInput.setData(unseenFreeformValues.join(";"))
        checkedMappings.push(unseenFreeformValues.length > 0)
        freeformInput.addCallbackAndRun(freeformValue => {
          checkedMappings[checkedMappings.length - 1] = !!freeformValue
        })
      }
    }
    if (confg.freeform?.key) {
      if (!confg.multiAnswer) {
        // Somehow, setting multi-answer freeform values is broken if this is not set
        freeformInput.setData(tgs[confg.freeform.key])
      }
    } else {
      freeformInput.setData(undefined)
    }
    feedback.setData(undefined)
  }

  $: {
    // Even though 'config' is not declared as a store, Svelte uses it as one to update the component
    // We want to (re)-initialize whenever the 'tags' or 'config' change - but not when 'checkedConfig' changes
    initialize($tags, config)
  }
  export let selectedTags: TagsFilter = undefined

  let mappings: Mapping[] = config?.mappings
  let searchTerm: UIEventSource<string> = new UIEventSource("")

  $: {
    try {
      selectedTags = config?.constructChangeSpecification(
        $freeformInput,
        selectedMapping,
        checkedMappings,
        tags.data
      )
    } catch (e) {
      console.error("Could not calculate changeSpecification:", e)
      selectedTags = undefined
    }
  }

  let dispatch = createEventDispatcher<{
    saved: {
      config: TagRenderingConfig
      applied: TagsFilter
    }
  }>()

  function onSave() {
    if (selectedTags === undefined) {
      console.log("SelectedTags is undefined, ignoring 'onSave'-event")
      return
    }
    if (layer === undefined || layer?.source === null) {
      /**
       * This is a special, priviliged layer.
       * We simply apply the tags onto the records
       */
      const kv = selectedTags.asChange(tags.data)
      for (const { k, v } of kv) {
        if (v === undefined || v === "") {
          delete tags.data[k]
        } else {
          tags.data[k] = v
        }
      }
      tags.ping()
      return
    }

    dispatch("saved", { config, applied: selectedTags })
    const change = new ChangeTagAction(tags.data.id, selectedTags, tags.data, {
      theme: state.layout.id,
      changeType: "answer",
    })
    freeformInput.setData(undefined)
    selectedMapping = undefined
    selectedTags = undefined

    change
      .CreateChangeDescriptions()
      .then((changes) => state.changes.applyChanges(changes))
      .catch(console.error)
  }
  
  function onInputKeypress(e: Event){
      if (e.key === "Enter") {
        onSave();
      }
  } 

  let featureSwitchIsTesting = state?.featureSwitchIsTesting ?? new ImmutableStore(false)
  let featureSwitchIsDebugging =
    state?.featureSwitches?.featureSwitchIsDebugging ?? new ImmutableStore(false)
  let showTags = state?.userRelatedState?.showTags ?? new ImmutableStore(undefined)
  let numberOfCs = state?.osmConnection?.userDetails?.data?.csCount ?? 0
  let question = config.question
  $: question = config.question
  if (state?.osmConnection) {
    onDestroy(
      state.osmConnection?.userDetails?.addCallbackAndRun((ud) => {
        numberOfCs = ud.csCount
      })
    )
  }
</script>

{#if question !== undefined}
  <div
    class="interactive border-interactive relative flex flex-col overflow-y-auto p-1 px-2"
    style="max-height: 85vh"
  >
    <div class="sticky top-0" style="z-index: 11">
      <div class="interactive sticky top-0 flex justify-between">
        <span class="font-bold">
          <SpecialTranslation
            t={question}
            {tags}
            {state}
            {layer}
            feature={selectedElement}
          />
        </span>
        <slot name="upper-right" />
      </div>
    </div>

    {#if config.questionhint}
      <div class="max-h-60 overflow-y-auto">
        <SpecialTranslation
          t={config.questionhint}
          {tags}
          {state}
          {layer}
          feature={selectedElement}
        />
      </div>
    {/if}

    {#if config.mappings?.length >= 8}
      <div class="sticky flex w-full">
        <Search class="h-6 w-6"/>
        <input type="text" bind:value={$searchTerm} class="w-full" />
      </div>
    {/if}

    {#if config.freeform?.key && !(mappings?.length > 0)}
      <!-- There are no options to choose from, simply show the input element: fill out the text field -->
      <FreeformInput
        {config}
        {tags}
        {feedback}
        {unit}
        feature={selectedElement}
        value={freeformInput}
        on:submit={onSave}
      />
    {:else if mappings !== undefined && !config.multiAnswer}
      <!-- Simple radiobuttons as mapping -->
      <div class="flex flex-col">
        {#each config.mappings as mapping, i (mapping.then)}
          <!-- Even though we have a list of 'mappings' already, we still iterate over the list as to keep the original indices-->
          <TagRenderingMappingInput
            {mapping}
            {tags}
            {state}
            {selectedElement}
            {layer}
            {searchTerm}
            mappingIsSelected={selectedMapping === i}
          >
            <input
              type="radio"
              bind:group={selectedMapping}
              name={"mappings-radio-" + config.id}
              value={i}
              on:keypress={onInputKeypress}
             
            />
          </TagRenderingMappingInput>
        {/each}
        {#if config.freeform?.key}
          <label class="flex">
            <input
              type="radio"
              bind:group={selectedMapping}
              name={"mappings-radio-" + config.id}
              value={config.mappings?.length}
              on:keypress={onInputKeypress}
            />
            <FreeformInput
              {config}
              {tags}
              {feedback}
              {unit}
              feature={selectedElement}
              value={freeformInput}
              on:selected={() => (selectedMapping = config.mappings?.length)}
              on:submit={onSave}
            />
          </label>
        {/if}
      </div>
    {:else if mappings !== undefined && config.multiAnswer}
      <!-- Multiple answers can be chosen: checkboxes -->
      <div class="flex flex-col">
        {#each config.mappings as mapping, i (mapping.then)}
          <TagRenderingMappingInput
            {mapping}
            {tags}
            {state}
            {selectedElement}
            {layer}
            {searchTerm}
            mappingIsSelected={checkedMappings[i]}
          >
            <input
              type="checkbox"
              name={"mappings-checkbox-" + config.id + "-" + i}
              bind:checked={checkedMappings[i]}
              on:keypress={onInputKeypress}
            />
          </TagRenderingMappingInput>
        {/each}
        {#if config.freeform?.key}
          <label class="flex">
            <input
              type="checkbox"
              name={"mappings-checkbox-" + config.id + "-" + config.mappings?.length}
              bind:checked={checkedMappings[config.mappings.length]}
              on:keypress={onInputKeypress}
            />
            <FreeformInput
              {config}
              {tags}
              {feedback}
              {unit}
              feature={selectedElement}
              value={freeformInput}
              on:submit={onSave}
            />
          </label>
        {/if}
      </div>
    {/if}

    <LoginToggle {state}>
      <Loading slot="loading" />
      <SubtleButton slot="not-logged-in" on:click={() => state?.osmConnection?.AttemptLogin()}>
        <Login slot="image" class="h-8 w-8" />
        <Tr t={Translations.t.general.loginToStart} slot="message" />
      </SubtleButton>
      {#if $feedback !== undefined}
        <div class="alert">
          <Tr t={$feedback} />
        </div>
      {/if}
      <div
        class="interactive sticky bottom-0 flex flex-wrap-reverse items-stretch justify-end sm:flex-nowrap"
        style="z-index: 11"
      >
        <!-- TagRenderingQuestion-buttons -->
        <slot name="cancel" />
        <slot name="save-button" {selectedTags}>
          <button
            on:click={onSave}
            class={twJoin(selectedTags === undefined ? "disabled" : "button-shadow", "primary")}
          >
            <Tr t={Translations.t.general.save} />
          </button>
        </slot>
      </div>
      {#if UserRelatedState.SHOW_TAGS_VALUES.indexOf($showTags) >= 0 || ($showTags === "" && numberOfCs >= Constants.userJourney.tagsVisibleAt) || $featureSwitchIsTesting || $featureSwitchIsDebugging}
        <span class="flex flex-wrap justify-between">
          <TagHint {state} tags={selectedTags} currentProperties={$tags} />
          <span class="flex flex-wrap">
            {#if $featureSwitchIsTesting}
              Testmode &nbsp;
            {/if}
            {#if $featureSwitchIsTesting || $featureSwitchIsDebugging}
              <span class="subtle">{config.id}</span>
            {/if}
          </span>
        </span>
      {/if}
      <slot name="under-buttons" />
    </LoginToggle>
  </div>
{/if}
