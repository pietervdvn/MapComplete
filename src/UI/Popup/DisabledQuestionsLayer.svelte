<script lang="ts">
  /**
   * Gives an overview of questions which are disabled for the given theme
   */
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Tr from "../Base/Tr.svelte"
  import { Translation } from "../i18n/Translation"
  import { XMarkIcon } from "@babeard/svelte-heroicons/mini"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import DefaultIcon from "../Map/DefaultIcon.svelte"

  export let layer: LayerConfig
  export let state: ThemeViewState

  let disabledQuestions = state.userRelatedState.getThemeDisabled(state.theme.id, layer.id)

  function getQuestion(id: string): Translation {
    return layer.tagRenderings.find((q) => q.id === id).question.Subs({})
  }

  function enable(idToEnable: string) {
    const newList = disabledQuestions.data.filter((id) => id !== idToEnable)
    disabledQuestions.set(newList)
  }
</script>

{#if $disabledQuestions.length > 0}
  <div class="low-interaction p-2">
    <h4 class="my-2 flex">
      <div class="no-image-background block h-6 w-6">
        <DefaultIcon {layer}/>
      </div>
      <Tr t={layer.name} />
    </h4>
    <div class="flex">
      {#each $disabledQuestions as id}
        <button class="badge button-unstyled" on:click={() => enable(id)}>
          <Tr cls="ml-2" t={getQuestion(id)} />
          <XMarkIcon class="mr-2 h-4 w-4" />
        </button>
      {/each}
    </div>
  </div>
{/if}
