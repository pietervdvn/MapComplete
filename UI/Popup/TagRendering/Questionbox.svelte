<script lang="ts">

  /**
   * Shows all questions for which the answers are unknown.
   * The questions can either be shown all at once or one at a time (in which case they can be skipped)
   */
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import type { Feature } from "geojson";
  import type { SpecialVisualizationState } from "../../SpecialVisualization";
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
  import If from "../../Base/If.svelte";
  import { onDestroy } from "svelte";
  import TagRenderingQuestion from "./TagRenderingQuestion.svelte";
  import Tr from "../../Base/Tr.svelte";
  import Translations from "../../i18n/Translations.js";

  export let layer: LayerConfig;
  export let tags: UIEventSource<Record<string, string>>;
  export let selectedElement: Feature;
  export let state: SpecialVisualizationState;

  /**
   * If set, only questions for these labels will be shown
   */
  export let onlyForLabels: string[] | undefined = undefined;
  const _onlyForLabels = new Set(onlyForLabels);
  /**
   * If set, only questions _not_ having these labels will be shown
   */
  export let notForLabels: string[] | undefined = undefined;
  const _notForLabels = new Set(notForLabels);

  function allowed(labels: string[]) {
    if (onlyForLabels?.length > 0 && !labels.some(l => _onlyForLabels.has(l))) {
      return false;
    }
    if (notForLabels?.length > 0 && labels.some(l => _notForLabels.has(l))) {
      return false;
    }
    return true;
  }

  let skippedQuestions = new UIEventSource<Set<string>>(new Set<string>());

  let questionsToAsk = tags.map(tags => {
    const baseQuestions = (layer.tagRenderings ?? [])?.filter(tr => allowed(tr.labels) && tr.question !== undefined);
    const questionsToAsk: TagRenderingConfig[] = [];
    for (const baseQuestion of baseQuestions) {
      if (skippedQuestions.data.has(baseQuestion.id) > 0) {
        continue;
      }
      if (baseQuestion.condition !== undefined && !baseQuestion.condition.matchesProperties(tags)) {
        continue;
      }
      if (baseQuestion.IsKnown(tags)) {
        continue;
      }
      questionsToAsk.push(baseQuestion);
    }
    return questionsToAsk;

  }, [skippedQuestions]);
  
  let _questionsToAsk: TagRenderingConfig[];
  let _firstQuestion: TagRenderingConfig;
  onDestroy(questionsToAsk.subscribe(qta => {
    _questionsToAsk = qta;
    _firstQuestion = qta[0];
  }));

  let answered: number = 0;
  let skipped: number = 0;

  function focus(){
    
  }
  function skip(question: TagRenderingConfig, didAnswer: boolean = false) {
    skippedQuestions.data.add(question.id);
    skippedQuestions.ping();
    if (didAnswer) {
      answered++;
    } else {
      skipped++;
    }
  }
  $: console.log("Current questionbox state:", {answered, skipped, questionsToAsk, layer, selectedElement, tags})
</script>

{#if _questionsToAsk.length === 0}

  {#if skipped + answered > 0 }
    <div class="thanks">
      <Tr t={Translations.t.general.questionBox.done} />
    </div>
    {#if answered === 0}
      {#if skipped === 1}
        <Tr t={Translations.t.general.questionBox.skippedOne} />
      {:else}
        <Tr t={Translations.t.general.questionBox.skippedMultiple.Subs({skipped})} />

      {/if}
    {:else if answered === 1}
      {#if skipped === 0}
        <Tr t={Translations.t.general.questionBox.answeredOne} />
      {:else if skipped === 1}
        <Tr t={Translations.t.general.questionBox.answeredOneSkippedOne} />
      {:else}
        <Tr t={Translations.t.general.questionBox.answeredOneSkippedMultiple.Subs({skipped})} />

      {/if}
    {:else}
      {#if skipped === 0}
        <Tr t={Translations.t.general.questionBox.answeredMultiple.Subs({answered})} />
      {:else if skipped === 1}
        <Tr t={Translations.t.general.questionBox.answeredMultipleSkippedOne.Subs({answered})} />
      {:else}
        <Tr
          t={Translations.t.general.questionBox.answeredMultipleSkippedMultiple.Subs({answered, skipped})} />

      {/if}
    {/if}

    {#if skipped > 0 }
      <button on:click={() => {skippedQuestions.setData(new Set()); skipped=0}}>
        Re-activate skipped questions
      </button>
    {/if}
  {/if}
{:else }
  <div>
    <If condition={state.userRelatedState.showAllQuestionsAtOnce}>
      <div>
        {#each _questionsToAsk as question (question.id)}
          <TagRenderingQuestion config={question} {tags} {selectedElement} {state} {layer}></TagRenderingQuestion>
        {/each}
      </div>

      <div slot="else">
        <TagRenderingQuestion
          config={_firstQuestion} {layer} {selectedElement} {state} {tags}
          on:saved={() => {skip(_firstQuestion, true)}}>
          <button on:click={() => {skip(_firstQuestion)} }
                  slot="cancel">
            <Tr t={Translations.t.general.skip}></Tr>
          </button>
        </TagRenderingQuestion>

      </div>

    </If>
  </div>
{/if}
