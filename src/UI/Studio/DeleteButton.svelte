<script lang="ts">
  import { EditJsonState } from "./EditLayerState"
  import BackButton from "../Base/BackButton.svelte"
  import { TrashIcon } from "@rgossiaux/svelte-heroicons/solid"
  import NextButton from "../Base/NextButton.svelte"

  let deleteState: "init" | "confirm" = "init"
  export let backToStudio: () => void
  export let state: EditJsonState

  export let objectType: "layer" | "theme"

  function deleteLayer() {
    state.delete()
    backToStudio()
  }
</script>

<div class="mt-12">
  {#if deleteState === "init"}
    <button on:click={() => {deleteState = "confirm"}} class="small">
      <TrashIcon class="h-6 w-6" />
      Delete this  {objectType}
    </button>
  {:else if deleteState === "confirm"}
    <div class="flex">
      <BackButton on:click={() => {deleteState = "init"}}>
        Don't delete
      </BackButton>
      <NextButton clss="primary" on:click={() => deleteLayer()}>
        <div class="alert flex p-2">

          <TrashIcon class="h-6 w-6" />
          Do delete this {objectType}
        </div>
      </NextButton>
    </div>
  {/if}
</div>
