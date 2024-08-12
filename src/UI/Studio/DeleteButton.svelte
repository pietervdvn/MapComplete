<script lang="ts">
  import { EditJsonState } from "./EditLayerState"
  import { TrashIcon } from "@rgossiaux/svelte-heroicons/solid"
  import NextButton from "../Base/NextButton.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"

  export let backToStudio: () => void
  export let state: EditJsonState

  export let objectType: "layer" | "theme"

  function deleteLayer() {
    state.delete()
    backToStudio()
  }
</script>

<AccordionSingle>
  <div slot="header" class="flex gap-x-2">
    <TrashIcon class="h-6 w-6" />
    Delete this {objectType}
  </div>

  <div class="flex flex-col">
    <div>
      Deleting this layer will delete your version. If you clicked a layer made by someone else, their version will
      remain.

      If you ever accidentally delete a layer, contact Pietervdvn. He might have a backup
    </div>

    <NextButton clss="primary" on:click={() => deleteLayer()}>
      <div class="alert flex p-2">
        <TrashIcon class="h-6 w-6" />
        Do delete this {objectType}
      </div>
    </NextButton>

  </div>

</AccordionSingle>

