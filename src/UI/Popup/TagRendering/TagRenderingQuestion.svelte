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
  import type { UploadableTag } from "../../../Logic/Tags/TagUtils"
  import { TagUtils } from "../../../Logic/Tags/TagUtils"

  import Search from "../../../assets/svg/Search.svelte"
  import Login from "../../../assets/svg/Login.svelte"
  import { placeholder } from "../../../Utils/placeholder"
  import { TrashIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { Tag } from "../../../Logic/Tags/Tag"
  import { get } from "svelte/store"
  import Markdown from "../../Base/Markdown.svelte"

  export let config: TagRenderingConfig
  export let tags: UIEventSource<Record<string, string>>

  export let selectedElement: Feature
  export let state: SpecialVisualizationState
  export let layer: LayerConfig | undefined
  export let selectedTags: UploadableTag = undefined

  export let allowDeleteOfFreeform: boolean = false

  let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)

  let unit: Unit = layer?.units?.find((unit) => unit.appliesToKeys.has(config.freeform?.key))

  // Will be bound if a freeform is available
  let freeformInput = new UIEventSource<string>(tags?.[config.freeform?.key])
  let freeformInputUnvalidated = new UIEventSource<string>(get(freeformInput))

  let selectedMapping: number = undefined
  /**
   * A list of booleans, used if multiAnswer is set
   */
  let checkedMappings: boolean[]

  let mappings: Mapping[] = config?.mappings ?? []
  let searchTerm: UIEventSource<string> = new UIEventSource("")

  let dispatch = createEventDispatcher<{
    saved: {
      config: TagRenderingConfig
      applied: TagsFilter
    }
  }>()

  /**
   * Prepares and fills the checkedMappings
   */
  console.log("Initing ", config.id)

  function initialize(tgs: Record<string, string>, confg: TagRenderingConfig): void {
    mappings = confg.mappings?.filter((m) => {
      if (typeof m.hideInAnswer === "boolean") {
        return !m.hideInAnswer
      }
      return !m.hideInAnswer.matchesProperties(tgs)
    })
    selectedMapping = mappings?.findIndex(mapping => mapping.if.matchesProperties(tgs) || mapping.alsoShowIf?.matchesProperties(tgs))
    if (selectedMapping < 0) {
      selectedMapping = undefined
    }
    // We received a new config -> reinit
    unit = layer?.units?.find((unit) => unit.appliesToKeys.has(config.freeform?.key))

    if (
      confg.mappings?.length > 0 &&
      confg.multiAnswer &&
      (checkedMappings === undefined ||
        checkedMappings?.length < confg.mappings.length + (confg.freeform ? 1 : 0))
    ) {
      const seenFreeforms = []
      // Initial setup of the mappings; detect checked mappings
      checkedMappings = [
        ...confg.mappings.map((mapping) => {
          if (mapping.hideInAnswer === true) {
            return false
          }
          const matches = TagUtils.MatchesMultiAnswer(mapping.if, tgs)
          if (matches && confg.freeform) {
            const newProps = TagUtils.changeAsProperties(mapping.if.asChange(tgs))
            seenFreeforms.push(newProps[confg.freeform.key])
          }
          return matches
        })
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
        freeformInput.set(unseenFreeformValues.join(";"))
        if (checkedMappings.length + 1 < mappings.length) {
          checkedMappings.push(unseenFreeformValues.length > 0)
        }
      }
    }
    if (confg.freeform?.key) {
      if (!confg.multiAnswer) {
        // Somehow, setting multi-answer freeform values is broken if this is not set
        freeformInput.set(tgs[confg.freeform.key])
      }
    } else {
      freeformInput.set(undefined)
    }
    feedback.setData(undefined)


  }

  let usedKeys: string[] = config.usedTags().flatMap(t => t.usedKeys())
  /**
   * The 'minimalTags' is a subset of the tags of the feature, only containing the values relevant for this object.
   * The main goal is to be stable and only 'ping' when an actual change is relevant
   */
  let minimalTags = new UIEventSource<Record<string, string>>(undefined)
  tags.addCallbackAndRunD(tags => {
    const previousMinimal = minimalTags.data
    const newMinimal: Record<string, string> = {}
    let somethingChanged = previousMinimal === undefined
    for (const key of usedKeys) {
      const newValue = tags[key]
      somethingChanged ||= previousMinimal?.[key] !== newValue
      if (newValue !== undefined && newValue !== null) {
        newMinimal[key] = newValue
      }

    }
    if (somethingChanged) {
      console.log("Updating minimal tags to", newMinimal,"of",config.id)
      minimalTags.setData(newMinimal)
    }
  })

  minimalTags.addCallbackAndRunD(tgs => {
    initialize(tgs, config)
  })


  onDestroy(
    freeformInput.subscribe((freeformValue) => {
      if (!mappings || mappings?.length == 0 || config.freeform?.key === undefined) {
        return
      }
      // If a freeform value is given, mark the 'mapping' as marked
      if (config.multiAnswer) {
        if (checkedMappings === undefined) {
          // Initialization didn't yet run
          return
        }
        checkedMappings[mappings.length] = freeformValue?.length > 0
        return
      }
      if (freeformValue?.length > 0) {
        selectedMapping = mappings.length
      }
    })
  )

  $: {
    if (
      allowDeleteOfFreeform &&
      $freeformInput === undefined &&
      $freeformInputUnvalidated === "" &&
      (mappings?.length ?? 0) === 0
    ) {
      selectedTags = new Tag(config.freeform.key, "")
    } else {
      try {
        selectedTags = config?.constructChangeSpecification(
          $freeformInput,
          selectedMapping,
          checkedMappings,
          tags.data
        )
        if (featureSwitchIsDebugging?.data) {
          console.log("Constructing change spec from", {
            freeform: $freeformInput,
            selectedMapping,
            checkedMappings,
            currentTags: tags.data
          }, " --> ", selectedTags)
        }
      } catch (e) {
        console.error("Could not calculate changeSpecification:", e)
        selectedTags = undefined
      }
    }
  }

  function onSave(_ = undefined) {
    if (selectedTags === undefined) {
      return
    }
    if (layer === undefined || (layer?.source === null && layer.id !== "favourite")) {
      /**
       * This is a special, privileged layer.
       * We simply apply the tags onto the records
       */
      const kv = selectedTags.asChange(tags.data)
      for (const { k, v } of kv) {
        if (v === undefined) {
          // Note: we _only_ delete if it is undefined. We _leave_ the empty string and assign it, so that data consumers get correct information
          delete tags.data[k]
        } else {
          tags.data[k] = v
        }
        feedback.setData(undefined)
      }
      tags.ping()
      return
    }
    dispatch("saved", { config, applied: selectedTags })
    const change = new ChangeTagAction(tags.data.id, selectedTags, tags.data, {
      theme: tags.data["_orig_theme"] ?? state.layout.id,
      changeType: "answer"
    })
    freeformInput.set(undefined)
    selectedMapping = undefined
    selectedTags = undefined

    change
      .CreateChangeDescriptions()
      .then((changes) => state.changes.applyChanges(changes))
      .catch(console.error)
  }

  function onInputKeypress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      onSave()
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
  <div class="relative">
    <form
      class="interactive border-interactive relative flex flex-col overflow-y-auto px-2"
      style="max-height: 75vh"
      on:submit|preventDefault={() => {
        /*onSave(); This submit is not needed and triggers to early, causing bugs: see #1808*/
      }}
    >
      <fieldset>
        <legend>
          <div class="interactive sticky top-0 justify-between pt-1 font-bold" style="z-index: 11">
            <SpecialTranslation t={question} {tags} {state} {layer} feature={selectedElement} />
          </div>

          {#if config.questionhint}
            {#if config.questionHintIsMd}
              <Markdown srcWritable={ config.questionhint.current} />
            {:else}
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
          {/if}
        </legend>

        {#if config.mappings?.length >= 8}
          <div class="sticky flex w-full" aria-hidden="true">
            <Search class="h-6 w-6" />
            <input
              type="text"
              bind:value={$searchTerm}
              class="w-full"
              use:placeholder={Translations.t.general.searchAnswer}
            />
          </div>
        {/if}

        {#if config.freeform?.key && !(mappings?.length > 0)}
          <!-- There are no options to choose from, simply show the input element: fill out the text field -->
          <FreeformInput
            {config}
            {tags}
            {feedback}
            {unit}
            {state}
            feature={selectedElement}
            value={freeformInput}
            unvalidatedText={freeformInputUnvalidated}
            on:submit={() => onSave()}
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
                  on:keypress={(e) => onInputKeypress(e)}
                />
              </TagRenderingMappingInput>
            {/each}
            {#if config.freeform?.key}
              <label class="flex gap-x-1">
                <input
                  type="radio"
                  bind:group={selectedMapping}
                  name={"mappings-radio-" + config.id}
                  value={config.mappings?.length}
                  on:keypress={(e) => onInputKeypress(e)}
                />
                <FreeformInput
                  {config}
                  {tags}
                  {feedback}
                  {unit}
                  {state}
                  feature={selectedElement}
                  value={freeformInput}
                  unvalidatedText={freeformInputUnvalidated}
                  on:selected={() => (selectedMapping = config.mappings?.length)}
                  on:submit={() => onSave()}
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
                  on:keypress={(e) => onInputKeypress(e)}
                />
              </TagRenderingMappingInput>
            {/each}
            {#if config.freeform?.key}
              <label class="flex gap-x-1">
                <input
                  type="checkbox"
                  name={"mappings-checkbox-" + config.id + "-" + config.mappings?.length}
                  bind:checked={checkedMappings[config.mappings.length]}
                  on:keypress={(e) => onInputKeypress(e)}
                />
                <FreeformInput
                  {config}
                  {tags}
                  {feedback}
                  {unit}
                  {state}
                  feature={selectedElement}
                  value={freeformInput}
                  unvalidatedText={freeformInputUnvalidated}
                  on:submit={() => onSave()}
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
            <div class="alert" aria-live="assertive" role="alert">
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
              {#if allowDeleteOfFreeform && (mappings?.length ?? 0) === 0 && $freeformInput === undefined && $freeformInputUnvalidated === ""}
                <button
                  class="primary flex"
                  on:click|stopPropagation|preventDefault={() => onSave()}
                >
                  <TrashIcon class="h-6 w-6 text-red-500" />
                  <Tr t={Translations.t.general.eraseValue} />
                </button>
              {:else}
                <button
                  on:click={() => onSave()}
                  class={twJoin(
                    selectedTags === undefined ? "disabled" : "button-shadow",
                    "primary"
                  )}
                >
                  <Tr t={Translations.t.general.save} />
                </button>
              {/if}
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
      </fieldset>
    </form>
  </div>
{/if}
