<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Loading from "../../assets/svg/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Icon from "../Map/Icon.svelte"
  import Maproulette from "../../Logic/Maproulette"
  import LoginToggle from "../Base/LoginToggle.svelte"

  /**
   * A UI-element to change the status of a maproulette-task
   */
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  export let message: string
  export let image: string
  export let message_closed: string
  export let statusToSet: string
  export let maproulette_id_key: string

  export let askFeedback: string = ""

  let applying = false
  let failed = false
  let feedback: string = ""

  /** Current status of the task*/
  let status: Store<number> = tags
    .map((tgs) => {
      if (tgs["status"]) {
        return tgs["status"]
      }
      return Maproulette.codeToIndex(tgs["mr_taskStatus"])
    })
    .map(Number)

  async function apply() {
    const maproulette_id = tags.data[maproulette_id_key] ?? tags.data.mr_taskId ?? tags.data.id
    try {
      await Maproulette.singleton.closeTask(Number(maproulette_id), Number(statusToSet), {
        tags: `MapComplete MapComplete:${state.layout.id}`,
        comment: feedback,
      })
      tags.data["mr_taskStatus"] = Maproulette.STATUS_MEANING[Number(statusToSet)]
      tags.data.status = statusToSet
      tags.ping()
    } catch (e) {
      console.error(e)
      failed = true
    }
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  {#if failed}
    <div class="alert">ERROR - could not close the MapRoulette task</div>
  {:else if applying}
    <Loading>
      <Tr t={Translations.t.general.loading} />
    </Loading>
  {:else if $status === Maproulette.STATUS_OPEN}
    {#if askFeedback !== "" && askFeedback !== undefined}
      <div class="interactive flex flex-col gap-y-1 border border-dashed border-gray-500 p-1">
        <h3>{askFeedback}</h3>
        <textarea bind:value={feedback} />
        <button
          class="no-image-background m-0 w-full p-4"
          class:disabled={feedback === ""}
          on:click={() => apply()}
        >
          <Icon clss="w-8 h-8 mr-2 shrink-0" icon={image} />
          {message}
        </button>
        {feedback}
      </div>
    {:else}
      <button class="no-image-background m-0 w-full p-4" on:click={() => apply()}>
        <Icon clss="w-8 h-8 mr-2 shrink-0" icon={image} />
        {message}
      </button>
    {/if}
  {:else}
    {message_closed}
  {/if}
</LoginToggle>
