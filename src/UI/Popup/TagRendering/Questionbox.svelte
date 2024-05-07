<script lang="ts">
  /**
   * Shows all questions for which the answers are unknown.
   * The questions can either be shown all at once or one at a time (in which case they can be skipped)
   */
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig"
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import TagRenderingQuestion from "./TagRenderingQuestion.svelte"
  import Tr from "../../Base/Tr.svelte"
  import Translations from "../../i18n/Translations.js"
  import { Utils } from "../../../Utils"
  import { onDestroy } from "svelte"

  export let layer: LayerConfig
  export let tags: UIEventSource<Record<string, string>>
  export let selectedElement: Feature
  export let state: SpecialVisualizationState

  /**
   * If set, only questions for these labels will be shown
   */
  export let onlyForLabels: string[] | undefined = undefined
  const _onlyForLabels = new Set(onlyForLabels)
  /**
   * If set, only questions _not_ having these labels will be shown
   */
  export let notForLabels: string[] | undefined = undefined
  const _notForLabels = new Set(notForLabels)
  let showAllQuestionsAtOnce = state.userRelatedState.showAllQuestionsAtOnce

  function allowed(labels: string[]) {
    if (onlyForLabels?.length > 0 && !labels.some((l) => _onlyForLabels.has(l))) {
      return false
    }
    if (notForLabels?.length > 0 && labels.some((l) => _notForLabels.has(l))) {
      return false
    }
    return true
  }

  let skippedQuestions = new UIEventSource<Set<string>>(new Set<string>())
  let questionboxElem: HTMLDivElement
  let questionsToAsk = tags.map(
    (tags) => {
      const baseQuestions = (layer.tagRenderings ?? [])?.filter(
        (tr) => allowed(tr.labels) && tr.question !== undefined
      )
      const questionsToAsk: TagRenderingConfig[] = []
      for (const baseQuestion of baseQuestions) {
        if (skippedQuestions.data.has(baseQuestion.id)) {
          continue
        }
        if (
          baseQuestion.condition !== undefined &&
          !baseQuestion.condition.matchesProperties(tags)
        ) {
          continue
        }
        if (baseQuestion.IsKnown(tags)) {
          continue
        }
        questionsToAsk.push(baseQuestion)
      }
      return questionsToAsk
    },
    [skippedQuestions]
  )
  let firstQuestion: UIEventSource<TagRenderingConfig> = new UIEventSource<TagRenderingConfig>(
    undefined
  )
  let allQuestionsToAsk: UIEventSource<TagRenderingConfig[]> = new UIEventSource<
    TagRenderingConfig[]
  >([])

  async function calculateQuestions() {
    console.log("Applying questions to ask")
    const qta = questionsToAsk.data
    firstQuestion.setData(undefined)
    //allQuestionsToAsk.setData([])
    await Utils.awaitAnimationFrame()
    firstQuestion.setData(qta[0])
    allQuestionsToAsk.setData(qta)
  }

  onDestroy(questionsToAsk.addCallback(() => calculateQuestions()))
  onDestroy(showAllQuestionsAtOnce.addCallback(() => calculateQuestions()))
  calculateQuestions()

  let answered: number = 0
  let skipped: number = 0

  function skip(question: { id: string }, didAnswer: boolean = false) {
    skippedQuestions.data.add(question.id)
    skippedQuestions.ping()
    if (didAnswer) {
      answered++
    } else {
      skipped++
    }
    window.setTimeout(() => {
      Utils.scrollIntoView(questionboxElem)
    }, 50)
  }
</script>

<div
  bind:this={questionboxElem}
  aria-live="polite"
  class="marker-questionbox-root"
  class:hidden={$questionsToAsk.length === 0 && skipped === 0 && answered === 0}
>
  {#if $allQuestionsToAsk.length === 0}
    {#if skipped + answered > 0}
      <div class="thanks">
        <Tr t={Translations.t.general.questionBox.done} />
      </div>
      {#if answered === 0}
        {#if skipped === 1}
          <Tr t={Translations.t.general.questionBox.skippedOne} />
        {:else}
          <Tr t={Translations.t.general.questionBox.skippedMultiple.Subs({ skipped })} />
        {/if}
      {:else if answered === 1}
        {#if skipped === 0}
          <Tr t={Translations.t.general.questionBox.answeredOne} />
        {:else if skipped === 1}
          <Tr t={Translations.t.general.questionBox.answeredOneSkippedOne} />
        {:else}
          <Tr t={Translations.t.general.questionBox.answeredOneSkippedMultiple.Subs({ skipped })} />
        {/if}
      {:else if skipped === 0}
        <Tr t={Translations.t.general.questionBox.answeredMultiple.Subs({ answered })} />
      {:else if skipped === 1}
        <Tr t={Translations.t.general.questionBox.answeredMultipleSkippedOne.Subs({ answered })} />
      {:else}
        <Tr
          t={Translations.t.general.questionBox.answeredMultipleSkippedMultiple.Subs({
            answered,
            skipped,
          })}
        />
      {/if}

      {#if skipped > 0}
        <button
          class="w-full"
          on:click={() => {
            skippedQuestions.setData(new Set())
            skipped = 0
          }}
        >
          <Tr t={Translations.t.general.questionBox.reactivate} />
        </button>
      {/if}
    {/if}
  {:else}
    <div>
      {#if $showAllQuestionsAtOnce}
        <div class="flex flex-col gap-y-1">
          {#each $allQuestionsToAsk as question (question.id)}
            <TagRenderingQuestion config={question} {tags} {selectedElement} {state} {layer} />
          {/each}
        </div>
      {:else if $firstQuestion !== undefined}
        <TagRenderingQuestion
          config={$firstQuestion}
          {layer}
          {selectedElement}
          {state}
          {tags}
          on:saved={() => {
            skip($firstQuestion, true)
          }}
        >
          <button
            class="secondary"
            on:click={() => {
              skip($firstQuestion)
            }}
            slot="cancel"
          >
            <Tr t={Translations.t.general.skip} />
          </button>
        </TagRenderingQuestion>
      {/if}
    </div>
  {/if}
</div>
