<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import Loading from "../../assets/svg/Loading.svelte";
  import Tr from "../Base/Tr.svelte";
  import Translations from "../i18n/Translations";
  import Icon from "../Map/Icon.svelte";
  import Maproulette from "../../Logic/Maproulette";

  /**
   * A UI-element to change the status of a maproulette-task
   */
  export let state: SpecialVisualizationState;
  export let tags: UIEventSource<Record<string, string>>;
  export let message: string;
  export let image: string;
  export let message_closed: string;
  export let statusToSet: string;
  export let maproulette_id_key: string;

  let applying = false;
  let failed = false;

  /** Current status of the task*/
  let status: Store<number> = tags
    .map((tgs) => {
      if (tgs["status"]) {
        return tgs["status"];
      }
      return Maproulette.codeToIndex(tgs["mr_taskStatus"]);
    }).map(Number);

  async function apply() {
    const maproulette_id =
      tags.data[maproulette_id_key] ??
      tags.data.mr_taskId ??
      tags.data.id;
    try {
      await Maproulette.singleton.closeTask(
        Number(maproulette_id),
        Number(statusToSet),
        {
          tags: `MapComplete MapComplete:${state.layout.id}`
        }
      );
      tags.data["mr_taskStatus"] =
        Maproulette.STATUS_MEANING[Number(statusToSet)];
      tags.data.status = statusToSet;
      tags.ping();
    } catch (e) {
      console.error(e);
      failed = true;
    }
  }

</script>

{#if failed}
  <div class="alert">
    ERROR - could not close the MapRoulette task
  </div>
{:else if applying}
  <Loading>
    <Tr t={Translations.t.general.loading} />
  </Loading>
{:else if $status === Maproulette.STATUS_OPEN}
  <button class="w-full p-4 no-image-background" on:click={() => apply()}>
    <Icon clss="w-8 h-8 mr-2" icon={image} />
    {message}
  </button>
{:else}
  {message_closed}
{/if}
