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

  console.log("Got layer", layer, onlyForLabels, notForLabels);

  const baseQuestions = (layer.tagRenderings ?? [])?.filter(tr => allowed(tr.labels) && tr.question !== undefined);
  console.log("BaseQuestions are", baseQuestions);
  let skippedQuestions = new UIEventSource<Set<string>>(new Set<string>());
  let answered : number = 0
  let questionsToAsk = tags.map(tags => {
    const questionsToAsk: TagRenderingConfig[] = [];
    for (const baseQuestion of baseQuestions) {
      if (skippedQuestions.data.has(baseQuestion.id) > 0) {
        continue;
      }
      if (baseQuestion.condition !== undefined && !baseQuestion.condition.matchesProperties(tags)) {
        continue;
      }
      questionsToAsk.push(baseQuestion);
    }
    return questionsToAsk;

  }, [skippedQuestions]);
  let _questionsToAsk: TagRenderingConfig[];
  let _firstQuestion: TagRenderingConfig
  onDestroy(questionsToAsk.subscribe(qta => {
    _questionsToAsk = qta;
    _firstQuestion = qta[0]
  }));

  function skip(question: TagRenderingConfig, didAnswer: boolean = false) {
    skippedQuestions.data.add(question.id);
    skippedQuestions.ping();
    if(didAnswer ){
      answered ++
    }
  }
</script>

{#if _questionsToAsk.length === 0}
  All done! You answered {answered} questions and skipped {$skippedQuestions.size} questions.
  {#if $skippedQuestions.size > 0 }
    <button on:click={() => skippedQuestions.setData(new Set())}>Re-activate skipped questions</button>
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
